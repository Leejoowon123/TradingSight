const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    stockName: String,
    stockCode: String
});

// "stock" 컬렉션과 연결되는 모델
const Stock = mongoose.model('Stock', stockSchema, 'stock');

module.exports = Stock;
