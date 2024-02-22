from flask import Flask, jsonify, request, send_file
from dateutil.relativedelta import relativedelta
from datetime import datetime, time
import requests
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__, static_url_path='', static_folder='static')
executor = ThreadPoolExecutor()

@app.route('/')
def index():
    return send_file('entry.html')

@app.route('/stockInfo', methods=['GET'])
def get_stock_details():
    api_key = 'cmu5ht9r01qsv99m22c0cmu5ht9r01qsv99m22cg'
    stockTickerSymbol = request.args.get('stockTickerSymbol')
    # print("stockTickerSymbol:", stockTickerSymbol)
    api_url = f'https://finnhub.io/api/v1/stock/profile2?symbol={stockTickerSymbol}&token={api_key}'
    # print("API URL:", api_url)
    if not stockTickerSymbol:
        return jsonify({'error': 'Stock symbol is required'}), 400

    try:
        response = requests.get(api_url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f'error making GET request: {e}')
    if response.status_code == 200:
        data = response.json()
        # print(data)
        return data
    else:
        # print( 'stocktickerSymbol', {stockTickerSymbol})
        print(f'Error: {response.status_code} - {response.text}')
        return response.text
        # return jsonify({'error': 'Failed to fetch the stock details'}), 500


@app.route('/stockSummary', methods=['GET'])
def get_stock_summary():
    api_key = 'cmu5ht9r01qsv99m22c0cmu5ht9r01qsv99m22cg'
    stockTickerSymbol = request.args.get('stockTickerSymbol')
    # print("stockTickerSymbol:", stockTickerSymbol)
    api_url = f'https://finnhub.io/api/v1/quote?symbol={stockTickerSymbol}&token={api_key}'
    # print("API URL:", api_url)
    if not stockTickerSymbol:
        return jsonify({'error': 'Stock symbol is required'}), 400

    try:
        response = requests.get(api_url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f'error making GET request: {e}')
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        # print( 'stocktickerSymbol', {stockTickerSymbol})
        # print(f'Error: {response.status_code} - {response.text}')
        return response.text
        # return jsonify({'error': 'Failed to fetch the stock details'}), 500


@app.route('/stockrecommendationTrends', methods=['GET'])
def get_stock_recommendation_trends():
    api_key = 'cmu5ht9r01qsv99m22c0cmu5ht9r01qsv99m22cg'
    stockTickerSymbol = request.args.get('stockTickerSymbol')
    # print("stockTickerSymbol:", stockTickerSymbol)
    api_url = f'https://finnhub.io/api/v1/stock/recommendation?symbol={stockTickerSymbol}&token={api_key}'
    # print("API URL:", api_url)
    if not stockTickerSymbol:
        return jsonify({'error': 'Stock symbol is required'}), 400

    try:
        response = requests.get(api_url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f'error making GET request: {e}')
    if response.status_code == 200:
        data = response.json()
        # print("data", data)
        return data
    else:
        # print( 'stocktickerSymbol', {stockTickerSymbol})
        print(f'Error: {response.status_code} - {response.text}')
        return response.text
        # return jsonify({'error': 'Failed to fetch the stock details'}), 500


@app.route('/companyNews', methods=['GET'])
def get_company_news():
    api_key = 'cmu5ht9r01qsv99m22c0cmu5ht9r01qsv99m22cg'
    stockTickerSymbol = request.args.get('stockTickerSymbol')
    endDate = datetime.now().date()
    startDate = endDate - relativedelta(days=30)
    # print("stockTickerSymbol:", stockTickerSymbol)
    # print("startDate", startDate)
    # print("endDate", endDate)
    api_url = f'https://finnhub.io/api/v1/company-news?symbol={stockTickerSymbol}&from={startDate}&to={endDate}&token={api_key}'
    # print("API URL:", api_url)
    if not stockTickerSymbol:
        return jsonify({'error': 'Stock symbol is required'}), 400

    try:
        response = requests.get(api_url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f'error making GET request: {e}')
    if response.status_code == 200:
        data = response.json()
        # print("data", data)
        return data
    else:
        # print( 'stocktickerSymbol', {stockTickerSymbol})
        print(f'Error: {response.status_code} - {response.text}')
        return response.text
        # return jsonify({'error': 'Failed to fetch the stock details'}), 500


@app.route('/highCharts', methods=['GET'])
def get_stock_highCharts():
    api_key = 'Veu4EyzzJTduRuvf0Y1woy5mwtn1mMIA'
    stockTickerSymbol = request.args.get('stockTickerSymbol')
    endDate = datetime.now().date()
    startDate = endDate - relativedelta(months=6, days=1)
    end_epoch_time = endDate
    start_epoch_time = startDate
    multiplier = 1
    timespan = "day"
    api_url = f'https://api.polygon.io/v2/aggs/ticker/{stockTickerSymbol}/range/{multiplier}/{timespan}/{start_epoch_time}/{end_epoch_time}?adjusted=true&sort=asc&apiKey={api_key}'
    
    if not stockTickerSymbol:
        return jsonify({'error': 'Stock symbol is required'}), 400

    try:
        response = requests.get(api_url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f'error making GET request: {e}')
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        # print( 'stocktickerSymbol', {stockTickerSymbol})
        print(f'Error: {response.status_code} - {response.text}')
        return response.text
        # return jsonify({'error': 'Failed to fetch the stock details'}), 500

if __name__ == '__main__':
    app.run(debug=False, use_reloader=True, port=8000)