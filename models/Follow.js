const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Follow = sequelize.define('Follow', {
    // Bu tablo sadece kimin kimi takip ettiğini tutar, ID'leri server.js'de ilişki kurarken otomatik ekleyeceğiz.
}, {
    tableName: 'Takipler',
    timestamps: false
});

module.exports = Follow;