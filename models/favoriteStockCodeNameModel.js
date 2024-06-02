const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: String,
    stockName: String,
    stockCode: String
});

const favorite = mongoose.model('favorite', favoriteSchema, 'favorite');

module.exports = favorite;
