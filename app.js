const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const mainRouter = require('./routes/mainRoute');
const session = require('express-session');
const cors = require('cors');

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

// 세션 미들웨어 설정
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// CORS 미들웨어 생성
const corsOptions = {
  origin: 'http://localhost:5001', // 요청을 보낼 출처의 URL
  methods: ['GET', 'POST'],      // 요청을 허용할 HTTP 메서드
  credentials: true              // 인증 정보를 포함할 경우 true로 설정
};


// CORS 미들웨어를 라우터에 적용
app.use(cors(corsOptions));

// body-parser 미들웨어 설정
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 경로 설정
app.use('/public/stylesheets', (req, res, next) => {
  res.setHeader('Content-Type', 'text/css');
  next();
}, express.static(path.join(__dirname, 'public', 'stylesheets')));

// 라우터 설정
app.use('/', mainRouter);

module.exports = app;
