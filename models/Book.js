const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Book = sequelize.define('Book', {
    kitap_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    baslik: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    aciklama: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'Kitaplar',
    timestamps: false
});

module.exports = Book;