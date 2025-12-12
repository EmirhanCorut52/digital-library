const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Author = sequelize.define('Author', {
    yazar_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ad_soyad: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    tableName: 'Yazarlar',
    timestamps: false
});

module.exports = Author;