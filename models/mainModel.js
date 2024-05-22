const mongoose = require('mongoose');

const mainSchema = new mongoose.Schema({
    name: String,
    email: String,
});

const Main = mongoose.model('Main', mainSchema);

module.exports = Main;
