const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_ISIM,
    process.env.DB_KULLANICI,
    process.env.DB_SIFRE,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT
    }
);

module.exports = sequelize;