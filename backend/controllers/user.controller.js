const db = require("../models");
const User = db.user;
const { Op } = require('sequelize');

exports.searchUsers = async (req, res) => {
  const { username } = req.query;
  const currentUserId = req.user?.id;

  try {
    const whereClause = {
      username: {
        [Op.like]: `%${username}%`
      }
    };

    if (currentUserId) {
      whereClause.id = {
        [Op.ne]: currentUserId
      };
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'username']
    });

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

exports.getUserByUsername = async (req, res) => {
  const username = req.params.username;

  try {
    const user = await db.user.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ id: user.id, username: user.username });
  } catch (error) {
    console.error('Error fetching user by username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
