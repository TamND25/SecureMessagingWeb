const db = require('../models');
const Friendship = db.Friendship;

exports.sendRequest = async (req, res) => {
  const requesterId = req.user?.id;
  const { addresseeId } = req.body;

  if (requesterId === addresseeId) {
    return res.status(400).json({ error: 'Cannot friend yourself' });
  }

  try {
    const requester = await db.user.findByPk(requesterId);
    if (!requester) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isBlockedByAddressee = await db.BlockedUser.findOne({
      where: { blockerId: addresseeId, blockedId: requesterId }
    });

    if (isBlockedByAddressee) {
      return res.status(403).json({ error: 'Can not send friend request' });
    }

    const hasBlockedAddressee = await db.BlockedUser.findOne({
      where: { blockerId: requesterId, blockedId: addresseeId }
    });

    if (hasBlockedAddressee) {
      return res.status(403).json({ error: 'You have blocked this user' });
    }

    const [friendship, created] = await Friendship.findOrCreate({
      where: { requesterId, addresseeId },
      defaults: { status: 'pending' }
    });

    if (!created) {
      return res.status(409).json({ error: 'Friend request already sent' });
    }

    res.status(201).json(friendship);
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Could not send friend request' });
  }
};

exports.acceptRequest = async (req, res) => {
  const requesterId = req.body.requesterId;
  const addresseeId = req.user?.id;

  try {
    const friendship = await Friendship.findOne({
      where: {
        requesterId,
        addresseeId,
        status: 'pending'
      }
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found or already handled' });
    }

    friendship.status = 'accepted';
    await friendship.save();

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ error: 'Failed to accept request' });
  }
};

exports.declineRequest = async (req, res) => {
  const requesterId = req.body.requesterId;
  const addresseeId = req.user?.id;

  try {
    const friendship = await Friendship.findOne({
      where: {
        requesterId,
        addresseeId,
        status: 'pending'
      }
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found or already handled' });
    }

    await friendship.destroy();
    res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Error declining request:', error);
    res.status(500).json({ error: 'Failed to decline request' });
  }
};

exports.unfriendUser = async (req, res) => {
  const userId = req.user?.id;
  const { friendId } = req.body;

  if (userId === friendId) {
    return res.status(400).json({ error: 'Cannot unfriend yourself' });
  }

  try {
    const deleted = await db.Friendship.destroy({
      where: {
        [db.Sequelize.Op.or]: [
          { requesterId: userId, addresseeId: friendId },
          { requesterId: friendId, addresseeId: userId }
        ],
        status: 'accepted'
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    res.status(200).json({ message: 'Unfriended successfully' });
  } catch (error) {
    console.error('Error unfriending user:', error);
    res.status(500).json({ error: 'Failed to unfriend user' });
  }
};

exports.getPendingRequests = async (req, res) => {
  const addresseeId = req.user?.id;

  try {
    const requests = await db.Friendship.findAll({
      where: {
        addresseeId,
        status: 'pending'
      },
      include: [
        {
          model: db.user,
          as: 'Requester',
          attributes: ['id', 'username']
        }
      ]
    });

    const result = requests
      .filter(r => r.Requester)
      .map(r => ({
        id: r.Requester.id,
        username: r.Requester.username
      }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ error: 'Could not fetch friend requests' });
  }
};

exports.getAcceptedFriends = async (req, res) => {
  const userId = req.user?.id;

  try {
    const friendships = await db.Friendship.findAll({
      where: {
        status: 'accepted',
        [db.Sequelize.Op.or]: [
          { requesterId: userId },
          { addresseeId: userId }
        ]
      },
      include: [
        {
          model: db.user,
          as: 'Requester',
          attributes: ['id', 'username']
        },
        {
          model: db.user,
          as: 'Addressee',
          attributes: ['id', 'username']
        }
      ]
    });

    const result = [];
    const seen = new Set();

    friendships.forEach(f => {
      const friend = f.requesterId === userId ? f.Addressee : f.Requester;

      if (!seen.has(friend.id)) {
        seen.add(friend.id);
        result.push({
          id: friend.id,
          username: friend.username
        });
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching accepted friends:', error);
    res.status(500).json({ error: 'Could not fetch accepted friends' });
  }
};

exports.blockUser = async (req, res) => {
  const blockerId = req.user?.id;
  const { blockedId } = req.body;

  if (blockerId === blockedId) {
    return res.status(400).json({ error: 'Cannot block yourself' });
  }

  try {
    await db.Friendship.destroy({
      where: {
        [db.Sequelize.Op.or]: [
          { requesterId: blockerId, addresseeId: blockedId },
          { requesterId: blockedId, addresseeId: blockerId }
        ]
      }
    });

    const [block, created] = await db.BlockedUser.findOrCreate({
      where: { blockerId, blockedId }
    });

    if (!created) {
      return res.status(409).json({ error: 'User already blocked' });
    }

    res.status(201).json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
};

exports.getBlockedUsers = async (req, res) => {
  const blockerId = req.user?.id;

  try {
    const blocks = await db.BlockedUser.findAll({
      where: { blockerId },
      include: [{ model: db.user, as: 'Blocked', attributes: ['id', 'username'] }]
    });

    res.json(blocks.map(b => ({
      id: b.Blocked.id,
      username: b.Blocked.username
    })));
  } catch (error) {
    console.error('Error getting blocked users:', error);
    res.status(500).json({ error: 'Failed to retrieve blocked users' });
  }
};

exports.unblockUser = async (req, res) => {
  const blockerId = req.user?.id;
  const { blockedId } = req.body;

  if (blockerId === blockedId) {
    return res.status(400).json({ error: 'Cannot unblock yourself' });
  }

  try {
    const block = await db.BlockedUser.findOne({
      where: { blockerId, blockedId }
    });

    if (!block) {
      return res.status(404).json({ error: 'User not blocked' });
    }

    await block.destroy();
    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
};