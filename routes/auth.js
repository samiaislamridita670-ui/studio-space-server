const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

let db;

router.setDatabase = (database) => {
  db = database;
};

const COOKIE_NAME = "studiospace_token";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

function getPublicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    photoURL: user.photoURL || "",
    role: user.role || "user",
  };
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (
      password.length < 6 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters, one uppercase letter and one lowercase letter.",
      });
    }

    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      photoURL:
        typeof photoURL === "string" ? photoURL.trim() : "",
      role: "user",
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      user: {
        id: result.insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        photoURL: newUser.photoURL,
        role: newUser.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await db.collection("users").findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing.");

      return res.status(500).json({
        success: false,
        message: "Authentication is not configured.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );

    res.cookie(COOKIE_NAME, token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Logged in successfully!",
      user: getPublicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// CURRENT USER
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
      });
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session.",
      });
    }

    const { ObjectId } = require("mongodb");

    if (!ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid session.",
      });
    }

    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      user: getPublicUser(user),
    });
  } catch (error) {
    console.error("Current user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify session.",
    });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);

  return res.json({
    success: true,
    message: "Logged out successfully!",
  });
});

module.exports = router;
