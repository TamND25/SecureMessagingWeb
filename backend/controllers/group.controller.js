const { Group, GroupMember, GroupKey, user: User } = require("../models");

const isUserOwner = async (groupId, userId) => {
  const member = await GroupMember.findOne({
    where: { groupId, userId },
  });
  return member?.isOwner;
};

exports.createGroup = async (req, res) => {
  const { name, avatar, memberIds, groupKeyMap } = req.body;
  const userId = req.user.id;

  if (!name || !Array.isArray(memberIds) || memberIds.length < 2 || !groupKeyMap) {
    return res.status(400).json({
      error: "Group must have a name and at least 3 members including the creator",
    });
  }

  try {
    const group = await Group.create({ name, avatar, createdBy: userId });

    const allMemberIds = [...new Set([userId, ...memberIds.map((id) => parseInt(id))])];

    await Promise.all(
      allMemberIds.map((uid) =>
        GroupMember.create({
          groupId: group.id,
          userId: uid,
          isOwner: uid === userId,
        })
      )
    );

    await Promise.all(
      Object.entries(groupKeyMap).map(([recipientId, encryptedKey]) =>
        GroupKey.create({
          groupId: group.id,
          recipientId: parseInt(recipientId),
          encryptedKey,
        })
      )
    );

    res.status(201).json({ message: "Group created successfully", groupId: group.id });
  } catch (err) {
    console.error("Group creation error:", err);
    res.status(500).json({ error: "Server error creating group" });
  }
};

exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [
        {
          model: GroupMember,
          as: "groupMembers",
          where: { userId: req.user.id },
        },
      ],
    });
    res.json(groups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

exports.leaveGroup = async (req, res) => {
  const userId = req.user.id;
  const { groupId } = req.params;

  try {
    const leavingMember = await GroupMember.findOne({ where: { userId, groupId } });
    if (!leavingMember) {
      return res.status(404).json({ error: "You are not a member of this group" });
    }

    const isLeavingOwner = leavingMember.isOwner;

    await GroupMember.destroy({ where: { userId, groupId } });

    if (isLeavingOwner) {
      const remainingOwners = await GroupMember.count({
        where: { groupId, isOwner: true },
      });

      if (remainingOwners === 0) {
        const nextMember = await GroupMember.findOne({
          where: { groupId },
          order: [['createdAt', 'ASC']],
        });

        if (nextMember) {
          nextMember.isOwner = true;
          await nextMember.save();
          console.log(`User ${nextMember.userId} promoted to owner of group ${groupId}`);
        }
      }
    }

    console.log(`User ${userId} left group ${groupId}`);
    return res.status(200).json({ message: "Left group successfully" });
  } catch (err) {
    console.error("Leave group error:", err);
    return res.status(500).json({ error: "Failed to leave group" });
  }
};

exports.getGroupMembers = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    const membership = await GroupMember.findOne({ where: { groupId, userId } });
    if (!membership) {
      return res.status(403).json({ error: "Access denied: Not a group member." });
    }

    const members = await GroupMember.findAll({
      where: { groupId },
      include: [{ model: User, as: 'User', attributes: ['id', 'username'] }],
    });

    const memberList = members.map(m => ({
      id: m.User.id,
      username: m.User.username,
      isOwner: m.isOwner,
    }));

    return res.json(memberList);
  } catch (err) {
    console.error("Error fetching group members:", err);
    return res.status(500).json({ error: "Failed to fetch group members" });
  }
};

exports.addMembers = async (req, res) => {
  const { groupId, userIds } = req.body;
  const requesterId = req.user.id;

  if (!(await isUserOwner(groupId, requesterId))) {
    return res.status(403).json({ error: "Only owners can add members" });
  }

  try {
    await Promise.all(
      userIds.map(uid =>
        GroupMember.findOrCreate({
          where: { groupId, userId: uid },
          defaults: { isOwner: false },
        })
      )
    );
    return res.json({ message: "Members added" });
  } catch (err) {
    console.error("Error adding members:", err);
    return res.status(500).json({ error: "Failed to add members" });
  }
};

exports.promoteToOwner = async (req, res) => {
  const requesterId = req.user.id;
  const { groupId, targetUserId } = req.body;

  if (!(await isUserOwner(groupId, requesterId))) {
    return res.status(403).json({ error: "Only owners can promote others" });
  }

  try {
    const result = await GroupMember.update(
      { isOwner: true },
      { where: { groupId, userId: targetUserId } }
    );
    return res.json({ message: "User promoted to owner", result });
  } catch (err) {
    console.error("Promote error:", err);
    return res.status(500).json({ error: "Failed to promote user" });
  }
};

exports.demoteOwner = async (req, res) => {
  const requesterId = req.user.id;
  const { groupId, targetUserId } = req.body;

  if (!(await isUserOwner(groupId, requesterId))) {
    return res.status(403).json({ error: "Only owners can demote others" });
  }

  try {
    const result = await GroupMember.update(
      { isOwner: false },
      { where: { groupId, userId: targetUserId } }
    );
    return res.json({ message: "User demoted", result });
  } catch (err) {
    console.error("Demote error:", err);
    return res.status(500).json({ error: "Failed to demote user" });
  }
};

exports.kickUser = async (req, res) => {
  const requesterId = req.user.id;
  const { groupId, targetUserId } = req.body;

  if (!(await isUserOwner(groupId, requesterId))) {
    return res.status(403).json({ error: "Only owners can kick users" });
  }

  try {
    const result = await GroupMember.destroy({
      where: { groupId, userId: targetUserId },
    });
    return res.json({ message: "User kicked from group", result });
  } catch (err) {
    console.error("Kick error:", err);
    return res.status(500).json({ error: "Failed to kick user" });
  }
};

exports.deleteGroup = async (req, res) => {
  const requesterId = req.user.id;
  const { groupId } = req.params;

  if (!(await isUserOwner(groupId, requesterId))) {
    return res.status(403).json({ error: "Only owners can delete group" });
  }

  try {
    await Group.destroy({ where: { id: groupId } });
    await GroupMember.destroy({ where: { groupId } });
    await GroupKey.destroy({ where: { groupId } });
    return res.json({ message: "Group deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ error: "Failed to delete group" });
  }
};
