const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient } = require("mongodb");

const studiosRouter = require("./routes/studios");
const authRouter = require("./routes/auth");

const app = express();

let db;
let clientPromise;

async function connectDatabase() {
  if (db) return db;

  if (!clientPromise) {
    const uri = process.env.MONGODB_URL;

    if (!uri) {
      throw new Error("MONGODB_URL is missing");
    }

    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  try {
    const client = await clientPromise;
    db = client.db("studioSpaceDB");
    return db;
  } catch (error) {
    clientPromise = null;
    throw error;
  }
}

const allowedOrigins = [
  "http://localhost:3000",
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(async (req, res, next) => {
  try {
    const database = await connectDatabase();
    authRouter.setDatabase(database);
    studiosRouter.setDatabase(database);
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(503).json({
      success: false,
      message: "Database is not available.",
    });
  }
});

app.get("/", (req, res) => {
  res.send("StudioSpace Server is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "StudioSpace API is running!",
    database: db ? "Connected" : "Disconnected",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/studios", studiosRouter);

module.exports = app;
