const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  console.log("Received JWT token:", token);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification failed:", err);
      return res.status(403).json({ error: 'Invalid token' });
    }

    console.log("Verified JWT payload:", user);
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
