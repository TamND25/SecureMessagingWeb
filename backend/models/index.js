const { Sequelize } = require("sequelize");
const sequelize = require("../config/db.config.js");

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user")(sequelize, Sequelize);

module.exports = db;
