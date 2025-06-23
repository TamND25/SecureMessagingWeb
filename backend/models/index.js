const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./User.js")(sequelize);
db.Friendship = require("./friendship")(sequelize, DataTypes);
db.message = require("./message")(sequelize, DataTypes);
db.BlockedUser = require("./blockedUser")(sequelize, DataTypes);

Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = db;
