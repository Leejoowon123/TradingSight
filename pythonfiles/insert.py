import pandas as pd
from pymongo import MongoClient

# MongoDB 연결
client = MongoClient('mongodb://localhost:27017/TradingSight')  # MongoDB 주소
db = client['TradingSight']  # 데이터베이스 이름

# Excel 파일 읽기
# excel_file = '/Users/Zen1/leeseongjun/KOSPI_yfinance_ticker.xlsx'  # Excel 파일 경로
excel_file = '/Users/Zen1/leeseongjun/KOSDAQ_yfinance_ticker.xlsx'  # Excel 파일 경로

df = pd.read_excel(excel_file)

# MongoDB 컬렉션 선택
collection = db['stock']  # 컬렉션 이름

# 데이터프레임의 각 행을 MongoDB에 삽입
for index, row in df.iterrows():
    data = {'stockName': row[0], 'stockCode': row[1]}
    collection.insert_one(data)

print("데이터 삽입이 완료되었습니다.")
