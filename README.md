# Webhook Manager

Webhook Manager is an application that allows users to manage and execute webhooks under different types. It provides both a GUI and a REST API for managing webhooks and webhook types.

## Features

- User can manage webhook types with a GUI
- User can manage Webhooks with a GUI
- REST API to CRUD types/webhooks and run webhooks by providing a type (name or id)
- Swagger documentation for the REST API routes
- User can run a webhook or a webhook type using the GUI
- JSON validation for webhook payloads
- Global settings for webhook timeout and GUI theme
- Self-hosted using Docker/docker-compose

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/webhook-manager.git
   cd webhook-manager
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   MONGODB_URI=mongodb://mongo:27017
   DB_NAME=webhook_manager
   SESSION_SECRET=your_session_secret_here
   BASIC_AUTH_USERNAME=admin
   BASIC_AUTH_PASSWORD=password
   ```

3. Build and run the Docker containers:
   ```
   docker-compose up --build
   ```

4. Access the application:
   - GUI: Open your browser and navigate to `http://localhost:3000`
   - API: The API is available at `http://localhost:3000/api`
   - API Documentation: Swagger UI is available at `http://localhost:3000/api-docs`

## Usage

### GUI

1. Webhook Types:
   - Navigate to the "Webhook Types" page
   - Create, edit, or delete webhook types

2. Webhooks:
   - Navigate to the "Webhooks" page
   - Create, edit, or delete webhooks
   - Run individual webhooks

3. Settings:
   - Navigate to the "Settings" page
   - Adjust global timeout and GUI theme

### API

The API is protected by Basic Authentication. Use the credentials specified in your .env file:
- Username: BASIC_AUTH_USERNAME
- Password: BASIC_AUTH_PASSWORD

Refer to the Swagger documentation at `/api-docs` for detailed API usage.

## Development

To run the application in development mode:

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

## License

This project is licensed under the MIT License.