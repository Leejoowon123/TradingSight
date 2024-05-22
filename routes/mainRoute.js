//이건 Sptring Boot로 치면 컨트롤러 같은거임

//express 프레임워크 사용
var express = require('express');
//Router객체 생성
var router = express.Router();
const Main = require('../models/mainModel'); // Main 모델 import

//get main화면을 랜더링
router.get('/', async (req, res) => {
  res.render('mainView', { title: 'Express' })
})

router.post('/data', async (req, res) => {
  const { name, email } = req.body;
  const main = new Main({ name, email });
  await main.save();
  res.redirect('/');
});

//라우터 외부 전송
module.exports = router;
