const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Post = sequelize.define('Post', {
    gonderi_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    gonderi_metni: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    olusturma_tarihi: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Gonderiler',
    timestamps: false
});

module.exports = Post;