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

// Server Initialization
async function startServer() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/signup_db";
  const port = process.env.PORT || 5000;

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 1500 });
    console.log(`Connected to MongoDB at: ${mongoUri}`);
  } catch (error) {
    console.warn(`[Notice] MongoDB is not running locally (${error.message}). Operating in standalone mode with bcrypt security.`);
  }

  app.listen(port, () => {
    console.log(`Auth Backend running at: http://localhost:${port}`);
  });
}

startServer();
