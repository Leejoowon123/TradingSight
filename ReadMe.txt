
이성준이 고생하면서 알아낸 exrpess.js를 통해 웹 개발을 하기 앞서 알아야할 정보들

기본정보

1. 프레임워크 : exrpess.js 사용
2. 프로젝트 구성 : espress.js generator을 이용한 일반적인 프로젝트 구조
3. 데이터베이스 : mongoDB community사용(https://www.mongodb.com/try/download/community),
   mysql의 워크밴치 같은 mongoDBcompass를 설치할 것(https://www.mongodb.com/ko-kr/products/tools/compass)
4. 뭐가 설치 안되어 있다고 나오면 npm install ~~를 해서 설치할 것(관리자권한으로 설치)
5. mongoDB에서 데이터베이스 이름은 TradingSight로 하면 설정 건드릴 것 없음.
6. npm start를 통해 서버 시작.
7. mongoDB에 이름, 이메일을 넣는 테스트 코드가 작성되어 있음.

프로젝트 구성

 1.views디렉터리 : SpringBoot에서의 html폴더와 비슷 html에 express.js기능을 추가한 .ejs확장자를 사용하는 파일을 사용함
    기본적인 사용법은 html과 동일하니 신경안쓰고 사용해도 됨.
 
 2. routes디렉터리 : SpringBoot에서의 controller느낌 get, post요청 등을 처리하는 route파일을 저장

 3. app.js파일 route파일들에 대해 주소를 설정해주는 역할

 4. public디렉터리 이미지디렉터리, .ejs에 대한 자바스크립트디렉터리, css디렉터리 등을 저장함

 5. models디렉터리 mongoDB에 데이터를 넣기위한 구조를 정의하는 파일들을 저장

 6. bin/www파일 각종 설정을 저장함. SpringBoot에서의 application.yml느낌

-------------------------------------------------------------------------------------------------------------------

db에 주식정보 넣는방법

1. mongodb에 데이터베이스이름:TradingSight 컬랙션이름:stock로 생성.

2. 내가보낸 엑셀파일을 다운로드 받은 후 pythonfiles폴더의 insert.py에
excel_file = '/Users/Zen1/leeseongjun/KOSDAQ_yfinance_ticker.xlsx'  # Excel 파일 경로
 위 경롤를 다운받은 파일 경로로 변경해서 실행하면 mongodb에 다 들어가있을 것임


