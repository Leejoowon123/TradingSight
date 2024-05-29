//이건 Sptring Boot로 치면 컨트롤러 같은거임

//express 프레임워크 사용
var express = require('express');
//Router객체 생성
var router = express.Router();
const Stock = require('../models/stockNameCodeModel'); //

//get main화면을 랜더링
router.get('/', async (req, res) => {
  res.render('mainView')
})

router.post('/search', async (req, res) => {
  const { stock_name } = req.body;
  console.log(stock_name + " ejs 값 가져오기 정상");

  try {
    const stock = await Stock.findOne({ stockName: stock_name });
    console.log(stock + " db로 부터 주식코드 발견");

    if (stock) {
      res.redirect('/stockShow?stockCode=' + stock.stockCode);
      res.redirect('/stockShow?stockName=' + stock.stockName);
      console.log(stock);
    } else {
      res.status(404).json({ message: 'Stock not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/stockShow', async (req, res) => {
  const stockCode = req.query.stockCode;
  const stockName = req.query.stockName;
  console.log(stockCode);
  res.render('stockShowView', { stockCode });
})


//라우터 외부 전송
module.exports = router;
