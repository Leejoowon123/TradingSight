import os
import datetime as dt
import yfinance as yf
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.preprocessing import MinMaxScaler
import matplotlib
# GUI 백엔드 대신 "Agg" 백엔드 사용
matplotlib.use('Agg')  
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify, send_file

app = Flask(__name__)

@app.route('/stock-prediction', methods=['POST'])
def receive_stock_code():
    data = request.get_json()  # 요청에서 JSON 데이터 가져오기
    stock_code = data.get("stock_code")  # 'stock_code' 값을 추출
    print(stock_code)

    if not stock_code:
        return jsonify({"error": "Stock code not provided."}), 400
    
    today = dt.datetime.today().date()
    one_year_ago = today - dt.timedelta(days=365)

    # 주식 코드로 주가 데이터 다운로드
    data = yf.download(stock_code, start=one_year_ago, end=today)
    closing_prices = data['Close']

    # 데이터 스케일링
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_prices = scaler.fit_transform(np.array(closing_prices).reshape(-1, 1))

    # 데이터셋 생성
    def create_dataset(data, look_back):
        X, Y = [], []
        for i in range(len(data) - look_back):
            X.append(data[i:i + look_back])
            Y.append(data[i + look_back])
        return np.array(X), np.array(Y)

    look_back = 20
    X, Y = create_dataset(scaled_prices, look_back)

    # LSTM 모델 생성 및 훈련
    model = keras.Sequential([
        layers.LSTM(50, activation='relu', input_shape=(look_back, 1)),
        layers.Dense(1)
    ])
    
    model.compile(optimizer='adam', loss='mse')
    model.fit(X, Y, epochs=20, verbose=1)

    # 미래 30일 예측
    future_forecast = []
    last_sequence = scaled_prices[-look_back:]

    for _ in range(30):
        prediction = model.predict(last_sequence.reshape(1, look_back, 1))
        future_forecast.append(prediction[0][0])
        last_sequence = np.append(last_sequence[1:], prediction)

    # 스케일링 해제
    future_forecast = scaler.inverse_transform(np.array(future_forecast).reshape(-1, 1))

    # 예측 결과 시각화
    future_dates = [today + dt.timedelta(days=i) for i in range(1, 31)]

    plt.figure(figsize=(12, 6))
    plt.plot(closing_prices, label='Closing Prices', color='blue')
    plt.plot(future_dates, future_forecast, label='30-Day Forecast', linestyle='--', color='red')
    plt.xlabel('Date')
    plt.ylabel('Stock Price (KRW)')
    plt.legend()    

    # 이미지 저장(서버에 저장되는것을 구현)
    image_dir = '/Users/Zen1/leeseongjun/nodejsStudy/aaa'
    if not os.path.exists(image_dir):
        os.makedirs(image_dir)

     # 파일 이름에 숫자를 붙여 저장
    image_path = os.path.join(image_dir, f'stock_prediction_{stock_code}.png')

    plt.savefig(image_path)

    # 이미지 전송
    return send_file(image_path, mimetype='image/png')

if __name__ == "__main__":
    app.run(port=5001, host='0.0.0.0')  # 호스트를 0.0.0.0으로 설정하여 외부에서 접속 가능하게 함
    plt.close()