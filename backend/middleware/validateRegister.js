module.exports = (req, res, next) => {
    const { email, username, password } = req.body;
  
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    next();
  };
  