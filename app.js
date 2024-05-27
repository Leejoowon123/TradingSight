const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const mainRouter = require('./routes/mainRoute');

const app = express();

// MongoDB 연결 설정
mongoose.connect('mongodb://localhost:27017/TradingSight', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
db.once('open', () => {
  console.log('MongoDB connected successfully');
});

// 뷰 템플릿 엔진 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 미들웨어 설정
app.use(express.urlencoded({ extended: true }));
app.use('/public/stylesheets', (req, res, next) => {
  res.setHeader('Content-Type', 'text/css');
  next();
}, express.static(path.join(__dirname, 'public', 'stylesheets')));
// 라우터 설정
app.use('/', mainRouter);

module.exports = app;
