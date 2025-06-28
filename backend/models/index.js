const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./User.js")(sequelize, DataTypes);
db.Friendship = require("./friendship")(sequelize, DataTypes);
db.message = require("./message")(sequelize, DataTypes);
db.Reaction = require("./reaction")(sequelize, DataTypes);
db.Group = require("./group")(sequelize, DataTypes);
db.GroupMember = require("./groupMember")(sequelize, DataTypes);
db.BlockedUser = require("./blockedUser")(sequelize, DataTypes);
db.GroupKey = require("./groupKey")(sequelize, DataTypes);
db.GroupMessage = require("./groupMessage")(sequelize, DataTypes);

Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = db;
