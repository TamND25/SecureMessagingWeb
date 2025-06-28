const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;

exports.register = async (req, res) => {
  const { username, email, password, publicKey, encryptedPrivateKey, encryptedKey, salt, iv } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      username,
      email,
      password: hashedPassword,
      publicKey,
      encryptedPrivateKey,
      encryptedKey,
      salt,
      iv,
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ token, user: { id: newUser.id, username, email } });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: 'Registration error' });
  }
};


exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Generated token:", token);
    res.status(200).json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        publicKey: user.publicKey,
        encryptedPrivateKey: user.encryptedPrivateKey,
        encryptedKey: user.encryptedKey,
        salt: user.salt,
        iv: user.iv,
      }
     });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
