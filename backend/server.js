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
  const states = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };
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

    // Check for existing duplicate account
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered."
      });
    }

    // Cryptographic hashing with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Persist new user document in MongoDB
    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword
    });

    res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    // Catch MongoDB duplicate key error code
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
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB at: ${mongoUri}`);

    app.listen(port, () => {
      console.log(`Auth Server running at: http://localhost:${port}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.log("\n[Note] Running in standalone API mode without persistent DB. Connect MongoDB on 127.0.0.1:27017 to enable persistence.");
    app.listen(port, () => {
      console.log(`Auth Server running at: http://localhost:${port} (DB disconnected)`);
    });
  }
}

startServer();
