const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    stockName: String,
    stockCode: String
});

const Stock = mongoose.model('Stock', stockSchema, 'stock');

module.exports = Stock;
