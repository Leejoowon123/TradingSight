const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: String,
    userPassword: String
});

const Stock = mongoose.model('user', userSchema, 'user');

module.exports = Stock;
