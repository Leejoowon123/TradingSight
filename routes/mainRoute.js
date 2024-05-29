//이건 Sptring Boot로 치면 컨트롤러 같은거임

//express 프레임워크 사용
var express = require('express');
//Router객체 생성
var router = express.Router();
const Stock = require('../models/stockNameCodeModel');
const jwt = require('jsonwebtoken'); //jwt토큰
const http = require('http');
const { ConnectionStates } = require('mongoose');
const path = require('path'); // path 모듈 추가
const fs = require('fs'); // fs 모듈 추가
const { session } = require('passport');



//get main화면을 랜더링
router.get('/', async (req, res) => {
  res.render('mainView')
})

//main에서 주식을 검색하면 세션에 주식 값과 코드를 넣음.
router.post('/search', async (req, res) => {
  const { stock_name } = req.body;
  console.log(stock_name + " ejs 값 가져오기 ");

  try {
    const stock = await Stock.findOne({ stockName: stock_name });
    console.log(stock + " db로 부터 주식코드 가져오기");

    if (stock) {
      //검색한 주식이 있다면 jwt토큰을 생성하고 토큰 안에 stockCode, stockName를 저장한다
      const token = jwt.sign({
        stockCode: stock.stockCode, stockName: stock.stockName, role: 'admin'
      }, '1234');
      console.log(stock.stockCode + ' 토큰생성시');
      console.log(stock.stockName + ' 토큰생성시');
      req.session.token = token;

      res.redirect('/stockShow');
    } else {
      res.status(404).json({ message: 'Stock not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

//stockShow화면을 띄움, 값을 표시함
router.get('/stockShow', async (req, res) => {
  console.log('stockShow 페이지 랜더링');

  const token = req.session.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, '1234'); //토큰에 인증 한 후
      const { stockCode, stockName } = decoded;  //토큰에 있는 stockCode, stockName에 접근할 수 있음. 
      console.log(stockCode + ' 생성된 토큰에서 받아온 값');
      console.log(stockName + ' 생성된 토큰에서 받아온 값');

      if (decoded.role === 'admin') {
        const options = {
          hostname: 'localhost',
          port: 5001,
          path: '/stock-prediction',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const request = http.request(options, (response) => {
          const chunks = [];

          response.on('data', (chunk) => {
            chunks.push(chunk);
          });

          response.on('end', () => {
            try {
              // 모든 buffer 데이터를 하나의 buffer로 결합
              const bufferData = Buffer.concat(chunks);

              // 저장할 파일 경로 설정
              const fileName = `${stockCode}.png`;
              const dirPath = '/Users/Zen1/leeseongjun/nodejsStudy/TradingSight/stockImages';
              const filePath = path.join(dirPath, fileName);

              // 디렉토리 존재 여부 확인 및 생성
              if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
              }

              // 이미지 데이터를 파일로 저장
              fs.writeFile(filePath, bufferData, (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ error: 'Internal Server Error' });
                }

                // 이미지 파일 경로 반환
                const imageUrl = `/Users/Zen1/leeseongjun/nodejsStudy/TradingSight/stockImages${fileName}`;
                res.render('stockShowView', { stockCode, stockName, imageUrl }); //ejs로 값을 넘기기
              });
            } catch (error) {
              console.error(error);
              res.status(500).json({ error: 'Internal Server Error' });
            }
          });
        });

        request.on('error', (error) => {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        });

        request.write(JSON.stringify({ stock_code: stockCode }));
        request.end();
      } else {
        res.status(403).json({ error: 'Forbidden' });
      }
    } catch (err) {
      console.error(err);
      res.status(403).json({ message: 'Invalid token' });
    }
  }
  else {
    res.status(403).json({ message: 'Token is missing' });
  }
});

router.post('/stockShow/image', (req, res) => {
  const token = req.session.token;

  if (token) {
    const decoded = jwt.verify(token, '1234'); //토큰에 인증 한 후
    const { stockCode } = decoded;  //토큰에 있는 stockCode, stockName에 접근할 수 있음. 
    console.log(stockCode);
    // 이미지 파일 경로 설정
    const imagePath = `../stockImages/${stockCode}.png`;
    console.log(imagePath);
    // 이미지 파일을 클라이언트에게 전송
    res.sendFile(path.join(__dirname, imagePath));
  }
});

//라우터 외부 전송
module.exports = router;
