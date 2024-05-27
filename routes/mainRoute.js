//이건 Sptring Boot로 치면 컨트롤러 같은거임

//express 프레임워크 사용
var express = require('express');
//Router객체 생성
var router = express.Router();
const Stock = require('../models/stockNameCodeModel');

//get main화면을 랜더링
router.get('/', async (req, res) => {
  res.render('mainView', { title: 'Express' })
})

router.post('/search', async (req, res) => {
  const { stock_name } = req.body;
  console.log(stock_name + " 1");

  try {
    const stock = await Stock.findOne({ stockName: stock_name });
    console.log(stock + " 2");

    if (stock) {
      res.json({ stockCode: stock.stockCode });
    } else {
      res.status(404).json({ message: 'Stock not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


//라우터 외부 전송
module.exports = router;
