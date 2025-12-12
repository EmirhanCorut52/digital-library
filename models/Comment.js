const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Comment = sequelize.define('Comment', {
    yorum_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    yorum_metni: {
        type: DataTypes.TEXT
    },
    puan: {
        type: DataTypes.INTEGER
    },
    olusturma_tarihi: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Yorumlar',
    timestamps: false
});

module.exports = Comment;