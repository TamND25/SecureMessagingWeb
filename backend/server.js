require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const sequelize = require("./config/db.config");
const registerRoutes = require('./api/auth');
const messageRoutes = require("./api/message");
const userRoutes = require('./api/user');
const friendshipRoutes = require('./api/friendship');
const setupSocket = require("./socket");

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

// Logs
app.use((req, res, next) => {
  console.log(`Request method: ${req.method}, URL: ${req.url}`);
  next();
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