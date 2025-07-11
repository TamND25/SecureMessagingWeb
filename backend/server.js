require("dotenv").config();

const path = require("path");
const express = require("express");
const http = require("http");
const cors = require("cors");
const sequelize = require("./config/db.config");
const registerRoutes = require('./api/auth');
const messageRoutes = require("./api/message");
const userRoutes = require('./api/user');
const friendshipRoutes = require('./api/friendship');
const secureRoutes = require('./api/secure');
const groupRoutes = require("./api/group");
const groupMessageRoutes = require("./api/groupMessage");
const setupSocket = require("./socket");

const fs = require("fs");
const uploadDir = "uploads/";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", registerRoutes);
app.use("/api/user", userRoutes);
app.use("/api/friendship", friendshipRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/secure", secureRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/group/messages", groupMessageRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Logs
app.use((req, res, next) => {
  console.log(`Request method: ${req.method}, URL: ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

sequelize.authenticate()
  .then(() => {
    console.log('DB connected');

    setupSocket(server, require("./models"));

    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('DB connection error:', err);
  });