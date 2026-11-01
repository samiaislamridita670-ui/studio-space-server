const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { MongoClient } = require("mongodb");
const studiosRouter = require("./routes/studios");
const authRouter = require("./routes/auth");

dotenv.config();
console.log(
  "JWT Configuration:",
  process.env.JWT_SECRET ? "FOUND" : "MISSING"
);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

let db;
app.use(
  "/api/auth",
  (req, res, next) => {
    if (!db) {
      return res.status(503).json({
        success: false,
        message: "Database is not connected.",
      });
    }

    authRouter.setDatabase(db);
    next();
  },
  authRouter
);
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

app.use("/api/studios", (req, res, next) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: "Database is not connected",
    });
  }

  studiosRouter.setDatabase(db);
  next();
}, studiosRouter);

async function startServer() {
  if (!MONGODB_URL) {
    console.error("MONGODB_URL is missing from the .env file");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URL);

  try {
    await client.connect();
    db = client.db("studioSpaceDB");

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`StudioSpace Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    await client.close().catch(() => {});
    process.exit(1);
  }
}

startServer();
