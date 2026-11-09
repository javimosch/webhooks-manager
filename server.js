require("dotenv").config();
const express = require("express");
const User = require("./models/User");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const basicAuth = require("basic-auth");
const methodOverride = require("method-override");

const app = express();

// Connect to MongoDB
const mongoUri = `${process.env.MONGODB_URI}`;

mongoose
  .connect(mongoUri, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      dbName: process.env.DB_NAME,
    }),
  }),
);

// Basic Auth Middleware
const auth = (req, res, next) => {
  const user = basicAuth(req);
  if (
    !user ||
    user.name !== process.env.BASIC_AUTH_USERNAME ||
    user.pass !== process.env.BASIC_AUTH_PASSWORD
  ) {
    res.set("WWW-Authenticate", "Basic realm=Authorization Required");
    return res.sendStatus(401);
  }
  next();
};

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api", auth, require("./routes/api"));

// New route for email and invite code verification
app.post("/invite", async (req, res) => {
  const { email, inviteCode } = req.body;
  const validInviteCodes = process.env.INVITES_CODES.split(",");

  if (!validInviteCodes.includes(inviteCode)) {
    return res.status(401).json({ message: "Invalid invite code" });
  }

  try {
    const newUser = new User({ email });
    await newUser.save();
    res.status(200).json({ message: "User created successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
});

app.use("/", auth, require("./routes/gui"));

// Swagger documentation
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", auth, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
