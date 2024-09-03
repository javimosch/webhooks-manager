const request = require('supertest');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('../models/User');

// Mock the entire models/User module
jest.mock('../models/User');

let app;

beforeAll(async () => {
  app = express();
  
  // Add body-parser middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Setup session middleware for testing
  app.use(session({
    secret: 'test_secret',
    resave: false,
    saveUninitialized: false,
    store: {
      get: jest.fn(),
      set: jest.fn(),
      destroy: jest.fn()
    }
  }));

  // Mock route that requires authentication
  app.get('/protected', (req, res) => {
    if (req.session.userId) {
      res.status(200).json({ message: 'Access granted' });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  });

  // Mock login route
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && user.password === password) {
      req.session.userId = user._id;
      res.status(200).json({ message: 'Logged in successfully' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Session-based Authentication', () => {
  it('should deny access to protected route when not authenticated', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should allow access to protected route after successful login', async () => {
    jest.setTimeout(10000); // Increase timeout to 10 seconds
    // Mock user for successful login
    User.findOne.mockResolvedValue({ _id: '123', email: 'test@example.com', password: 'password123' });

    // Login
    const loginResponse = await request(app)
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ email: 'test@example.com', password: 'password123' }));
    expect(loginResponse.status).toBe(200);

    // Get the session cookie
    const cookies = loginResponse.headers['set-cookie'];

    // Access protected route with session cookie
    const protectedResponse = await request(app)
      .get('/protected')
      .set('Cookie', cookies);
    
    expect(protectedResponse.status).toBe(200);
    expect(protectedResponse.body.message).toBe('Access granted');
  });

  it('should deny access with invalid credentials', async () => {
    jest.setTimeout(10000); // Increase timeout to 10 seconds
    // Mock user not found
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ email: 'wrong@example.com', password: 'wrongpassword' }));
    
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });
});
