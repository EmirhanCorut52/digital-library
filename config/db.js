const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_URL);

(async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {}
})();

module.exports = sequelize;
