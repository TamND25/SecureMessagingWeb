require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db.config");
const registerRoutes = require('./api/auth');
const messageRoutes = require("./api/message");
const userRoutes = require('./api/user');
const friendshipRoutes = require('./api/friendship');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(registerRoutes)

app.use("/api/user", userRoutes);
app.use('/api/friendship', friendshipRoutes);

// Logs
app.use((req, res, next) => {
  console.log(`Request method: ${req.method}, URL: ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", registerRoutes);
app.use("/api/message", messageRoutes);

// Start Server
sequelize.authenticate()
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

