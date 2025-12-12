const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    kullanici_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    kullanici_adi: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    e_posta: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    parola_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    rol: {
        type: DataTypes.STRING(20),
        defaultValue: 'kullanici'
    },
    olusturma_tarihi: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Kullanicilar',
    timestamps: false
});

module.exports = User;