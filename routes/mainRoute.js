//이건 Sptring Boot로 치면 컨트롤러 같은거임

//express 프레임워크 사용
var express = require('express');
//Router객체 생성
var router = express.Router();
const Stock = require('../models/stockNameCodeModel');
const User = require('../models/userIdPasswordModel');
const Favorite = require('../models/favoriteStockCodeNameModel');
const jwt = require('jsonwebtoken'); //jwt토큰
const http = require('http');
const { ConnectionStates } = require('mongoose');
const path = require('path'); // path 모듈 추가
const fs = require('fs'); // fs 모듈 추가
const { session } = require('passport');
const favorite = require('../models/favoriteStockCodeNameModel');

//get main화면을 랜더링
router.get('/', async (req, res) => {
  const message = req.query.message || '';
  const loggedIn = req.session.userId ? true : false;
  res.render('mainView', { loggedIn, message })
})

router.get('/user/signIn', (req, res) => {
  const message = req.query.message || ''; // message 쿼리 파라미터를 가져오고, 값이 없는 경우 빈 문자열을 사용합니다.
  res.render('signInView', { message }); // 렌더링 시 message 변수를 전달합니다.
});


router.post('/user/signIn', async (req, res) => {
  res.redirect('/user/signIn');
})

router.post('/user/signIn/signInLogic', async (req, res) => {
  const { userId, userPassword } = req.body;
  console.log({ userId, userPassword });
  try {
    const user = await User.findOne({ userId, userPassword });
    console.log(user + '로그인 유저 정보');

    if (!user) {
      res.redirect('/user/signIn?message=로그인 정보를 확인해 주세요.')
    }
    else {
      req.session.userId = user.userId;
      res.redirect('/');
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Error during login");
  }
})

router.get('/user/signUp', async (req, res) => {
  const message = req.query.message || ''; // message 쿼리 파라미터를 가져오고, 값이 없는 경우 빈 문자열을 사용합니다.
  res.render('signUpView', { message: message });
})

router.post('/user/signUp', async (req, res) => {
  res.redirect('/user/signUp');
})

router.post('/user/signUp/signUpLogic', async (req, res) => {
  const { userId, userPassword } = req.body;
  // 아이디 유효성 검사: 8자 이상, 한글과 영어 숫자만 허용
  const userIdRegex = /^[가-힣a-zA-Z0-9]{8,}$/;
  if (!userIdRegex.test(userId)) {
    return res.redirect('/user/signUp?message=아이디는 8자 이상이어야 하며, 한글과 영어 숫자만 사용 가능합니다.');
  }
  // 비밀번호 유효성 검사: 8자 이상
  if (userPassword.length < 8) {
    return res.redirect('/user/signUp?message=비밀번호는 8자 이상이어야 하며, 한글과 영어 숫자만 사용 가능합니다.');
  }
  const user = await User.findOne({ userId });
  if (!user) {
    try {
      const newUser = await User.create({ userId, userPassword });
      console.log(newUser + ' user created!');
      return res.redirect('/user/signIn?message=회원가입 후 로그인해 주세요');
    } catch (error) {
      console.error('user create error:', error);
      return res.status(500).send("Error creating user");
    }
  } else {
    return res.status(400).send('중복된 아이디');
  }
});


router.get('/user/myPage', async (req, res) => {
  const message = req.query.message || '';
  const userId = req.session.userId;
  const user = await User.findOne({ userId });
  if (userId) {
    console.log(user.userId + '마이페이지 로그인정보');
    res.render('myPageView', { userId: user.userId, message });
  }
  else {
    res.redirect('/user/signIn')
  }
})

router.post('/user/myPage', async (req, res) => {
  res.redirect('/user/myPage');
})

router.post('/user/logout', async (req, res) => {

  const userId = req.session.userId;

  if (userId) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error while logging out:', err);
      }
      else {
        res.redirect('/');
      }
    });
  } else {
    res.redirect('/');
  }
})

router.post('/user/myPage/deleteUser', async (req, res) => {
  const userId = req.session.userId;
  console.log(userId + "delete방면");
  if (userId) {
    const deletedUser = await User.findOneAndDelete({ userId: userId });
    console.log(deletedUser + "이 삭제되었습니다");
    req.session.destroy();
    res.redirect('/?message=회원 탈퇴되었습니다.');
  }
  else {
    res.status(500).send('delete Error' + error);
  }
})

router.get('/user/myPage/updateMyPage', async (req, res) => {
  const message = req.query.message || '';
  console.log(message);
  const userId = req.session.userId;
  const user = await User.findOne({ userId });
  res.render('updateMyPage', { userId: user.userId, userPassword: user.userPassword, message });
})

router.post('/user/myPage/updateUser', async (req, res) => {
  res.redirect('/user/myPage/updateMyPage')
  console.log('회원비밀번호변경으로이동');
})

router.post('/user/myPage/updateNewPassword', async (req, res) => {
  const userId = req.session.userId;
  const newPassword = req.body.userPassword; // 새 비밀번호를 가져옴
  console.log(userId);
  console.log(newPassword);

  // const userIdRegex = /^[가-힣a-zA-Z0-9]{8,}$/;

  // 정의되어 있는지 확인
  if (!newPassword) {
    res.redirect('/user/myPage/updateMyPage?message=변경할 비밀번호를 입력해주세요');
    return; // 이후 코드 실행을 막기 위해 리턴 추가
  }

  if (newPassword.length < 8 || !/^[가-힣a-zA-Z0-9]{8,}$/.test(newPassword)) {
    res.redirect('/user/myPage/updateMyPage?message=비밀번호는 8자 이상이어야 하며, 한글, 영어 대소문자, 숫자로만 구성되어야 합니다.');
    return;
  }

  try {
    if (userId) {
      // 사용자 아이디로 데이터베이스에서 사용자를 찾아 비밀번호 업데이트
      const result = await User.updateOne({ userId: userId }, { $set: { userPassword: newPassword } });
      res.redirect('/user/myPage?message=비밀번호가 업데이트 되었습니다.');
    } else {
      // 사용자 아이디가 없으면 오류 메시지를 반환
      throw new Error('User ID not found');
    }
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: 'Error updating password', error: error.message });
  }
});

router.post('/user/favorite', async (req, res) => {
  const token = req.session.token;
  const decoded = jwt.verify(token, '1234');
  const { stockName, stockCode } = decoded;
  const userId = req.session.userId;
  console.log(stockName + 'favorite');
  console.log(stockCode);
  console.log(userId);

  if (token) {
    if (userId) {
      const userFavorite = await Favorite.findOne({ userId, stockName });
      console.log(userFavorite);
      if (!userFavorite) {
        await Favorite.create({ userId, stockName, stockCode });
        console.log('create favorite');
        res.redirect('/stockShow?message=관심목록에 추가되었습니다');
      } else {
        res.redirect('/stockShow?message=이미 관심목록에 추가된 주식입니다');
      }
    } else {
      res.redirect('/user/signIn?message=로그인 후 이용해주세요');
    }
  }
});

router.get('/user/myPage/userFavorite', async (req, res) => {
  const userId = req.session.userId;
  const userFavorite = await Favorite.find({ userId });
  console.log(userFavorite);

  if (userId) {
    try {
      if (userFavorite) {
        res.render('userFavoriteView', { userId: userId, favorites: userFavorite, message: '' });
      } else {
        res.render('userFavoriteView', { userId: userId, favorites: [], message: '관심종목이 없습니다.' });
      }
    } catch (error) {
      res.status(500).send('Internal Server Error')
    }
  } else {
    res.redirect('/user/signIn?message=로그인 후 이용해주세요');
  }
});

router.post('/user/myPage/userFavorite/delete/:id', async (req, res) => {
  const favoriteId = req.params.id;
  console.log(favoriteId + '삭제기능에서');
  try {
    await Favorite.findByIdAndDelete(favoriteId);
    res.redirect('/user/myPage/userFavorite');
  } catch {
    res.status(500).send('Delete Error');
  }
})

router.post('/user/myPage/userFavorite/image/:id', async (req, res) => {
  const userId = req.session.userId; // 사용자 id
  const favoriteId = req.params.id;  // 사용자 주식 id
  console.log(favoriteId + '이미지 기능에서');

  if (userId&&favoriteId) {
    try {
      const userFavorite = await Favorite.findOne({ _id: favoriteId, userId: userId });
      console.log(userFavorite);
      if (!userFavorite) {
        throw new Error('User favorite not found');
      }
      
      const stockCode = userFavorite.stockCode;
      console.log(stockCode + '이미지 stockCode');
      const imagePath = path.join(__dirname, '../stockImages', `${stockCode}.png`);
      console.log(imagePath);
      res.sendfile(imagePath);
      //res.redirect(`/user/myPage/userFavorite/image/${favoriteId}?imagePath=${encodeURIComponent(imagePath)}`);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  }
});

router.get('/user/myPage/userFavorite/image/:id', (req, res) => {
  const userId = req.session.userId;
  const imagePath = req.query.imagePath;

  if (userId&&imagePath) {
    res.render('favoriteImageView', { imagePath:imagePath });
    console.log("이미지 경로 렌더링: " + imagePath);
  } else {
    res.status(400).send('Image path is missing');
  }
});

router.post('/user/myPage/favorite', async (req, res) => {
  res.redirect('/user/myPage/userFavorite');
})

//main에서 주식을 검색하면 세션에 주식 값과 코드를 넣음.
router.post('/search', async (req, res) => {
  const userId = req.session.userId;
  const { stock_name } = req.body;
  console.log(stock_name + " ejs 값 가져오기 ");

  if (userId) {
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
        res.redirect('/?message=검색한 주식이 없습니다.')
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  }
  else {
    res.redirect('/user/signIn?message=로그인 후 이용해주세요');
  }
});

//stockShow화면을 띄움, 값을 표시함
router.get('/stockShow', async (req, res) => {
  console.log('stockShow 페이지 랜더링');

  const token = req.session.token;
  const message = req.query.message || '';

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
              // const imageUrl = `C:/workspace/TradingSight/stockImages${fileName}`; //이주원
              const dirPath = '/Users/idoyun/nodeP/TradingSight/stockImages'; //이도윤
              // const dirPath = '/Users/swFinal/TradingSight/stockImages';
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
                const imageUrl = `C:/workspace/TradingSight/stockImages${fileName}`;
                res.render('stockShowView', { stockCode, stockName, imageUrl, message }); //ejs로 값을 넘기기
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



    // 이미지 파일을 클라이언트에게 전
    res.sendFile(path.join(__dirname, imagePath));
  }
});

const { run } = require('../gemini/geminiApi');

router.post('/stockShow/AI', async (req, res) => {
  const token = req.session.token;
  if (token) {
    const decoded = jwt.verify(token, '1234'); //토큰에 인증 한 후
    const { stockCode } = decoded;  //토큰에 있는 stockCode, stockName에 접근할 수 있음. 
    console.log(stockCode);
    // 이미지 파일 경로 설정
    const imagePath = `../stockImages/${stockCode}.png`;
    console.log("stockCode : "+ stockCode)
    console.log("imagePath : "+ imagePath)
      try {
        // 이미지 경로는 요청 본문에서 받거나, 다른 방식으로 결정합니다.
        const resultText = await run(stockCode, imagePath);
        res.json({ message: resultText });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
  }
});



//라우터 외부 전송
module.exports = router;
