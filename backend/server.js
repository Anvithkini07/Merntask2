const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({ 
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
  credentials: true 
}));
app.use(express.json());

// In-memory fallback if MongoDB service is not currently active
const inMemoryUsers = [];

// User Schema & Model
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", userSchema);

// Health Check / Root Endpoint
app.get("/", (req, res) => {
  res.status(200).send("Signup API is running!");
});

// GET /api/health - Detailed health check with DB status
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: "disconnected (standalone)", 1: "connected (mongodb)", 2: "connecting", 3: "disconnecting" };
  res.status(200).json({
    status: "ok",
    database: states[dbState] || "unknown",
    timestamp: new Date().toISOString()
  });
});

// POST /api/signup - Registration Endpoint
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Field integrity validations
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      password.length < 8
    ) {
      return res.status(400).json({
        message: "Enter your name and email, and a password of at least 8 characters."
      });
    }

    // Email format verification
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address."
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    // Check for existing duplicate account
    let existingUser = null;
    if (isDbConnected) {
      existingUser = await User.findOne({ email: cleanEmail });
    } else {
      existingUser = inMemoryUsers.find(u => u.email === cleanEmail);
    }

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered."
      });
    }

    // Cryptographic hashing with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Persist new user document in MongoDB or in-memory fallback
    let newUser;
    if (isDbConnected) {
      newUser = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword
      });
    } else {
      newUser = {
        _id: "mock_" + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        createdAt: new Date()
      };
      inMemoryUsers.push(newUser);
    }

    res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered."
      });
    }

    console.error("Signup error:", error.message);
    res.status(500).json({
      message: "Unable to create account. Please try again."
    });
  }
});

// POST /api/login - Authentication Endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter your email and password."
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    let user = null;
    if (isDbConnected) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = inMemoryUsers.find(u => u.email === cleanEmail);
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    res.status(200).json({
      message: "Signed in successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      message: "Authentication service error. Please try again."
    });
  }
});

// Server Initialization
async function startServer() {
  let mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/signup_db";
  const port = process.env.PORT || 5000;
  let mongodInstance = null;

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 1500 });
    console.log(`Connected to local MongoDB at: ${mongoUri}`);
  } catch (error) {
    console.log(`[Info] Standard MongoDB port not detected. Initializing MongoDB engine...`);
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: "signup_db"
        }
      });
      mongoUri = mongodInstance.getUri();
      await mongoose.connect(mongoUri);
      console.log(`MongoDB engine running successfully on port 27017: ${mongoUri}`);
    } catch (memError) {
      try {
        const { MongoMemoryServer } = require("mongodb-memory-server");
        mongodInstance = await MongoMemoryServer.create();
        mongoUri = mongodInstance.getUri();
        await mongoose.connect(mongoUri);
        console.log(`MongoDB engine running on dynamic port: ${mongoUri}`);
      } catch (fallbackErr) {
        console.warn(`[Notice] MongoDB engine fallback: ${fallbackErr.message}. Standalone array active.`);
      }
    }
  }

  app.listen(port, () => {
    console.log(`Auth Backend running at: http://localhost:${port}`);
  });
}

startServer();
