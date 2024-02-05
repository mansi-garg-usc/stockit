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

def make_api_call(api_url):
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        # return response.json()
    except requests.exceptions.RequestException as e:
        return {'error': f'Failed to fetch data: {e}'}
    if response.status_code == 200:
        return response.json()
    else:
        print( 'stocktickerSymbol', {stockTickerSymbol})
        print(f'Error: {response.status_code} - {response.text}')
        return response.text

def get_stock_details_new(stockTickerSymbol):
    api_key = 'cmu5ht9r01qsv99m22c0cmu5ht9r01qsv99m22cg'
    api_url = f'https://finnhub.io/api/v1/stock/profile2?symbol={stockTickerSymbol}&token={api_key}'
    return make_api_call(api_url)

def get_stock_summary_new(stockTickerSymbol):
    api_key = 'cmu5ht9r01qsv99m22c0cmu5ht9r01qsv99m22cg'
    api_url = f'https://finnhub.io/api/v1/quote?symbol={stockTickerSymbol}&token={api_key}'
    return make_api_call(api_url)

def get_stock_recommendation_trends_new(stockTickerSymbol):
    api_url = f'https://finnhub.io/api/v1/stock/recommendation?symbol={stockTickerSymbol}&token={api_key}'
    api_key = 'cmu5ht9r01qsv99m22c0cmu5ht9r01qsv99m22cg'
    return make_api_call(api_url)

@app.route('/api', methods=['GET'])
def get_stock_data():
    stock_ticker_symbol = request.args.get('stockTickerSymbol')

    if not stock_ticker_symbol:
        return jsonify({'error': 'Stock symbol is required'}), 400

    api_functions = [get_stock_details_new, get_stock_summary_new]  # Add more functions as needed
    result = dict()
    for func in api_functions:
        key = func.__name__
        result[key] = func(stock_ticker_symbol)
        # result.update(func(stock_ticker_symbol))
        # result+= func(stock_ticker_symbol)
    
    # api_urls = [func(stock_ticker_symbol) for func in api_functions]

    # results = list(executor.map(make_api_call, api_urls))

    return jsonify(result)


@app.route('/stockInfo', methods=['GET'])
def get_stock_details():
    api_key = 'cmu5ht9r01qsv99m22c0cmu5ht9r01qsv99m22cg'
    stockTickerSymbol = request.args.get('stockTickerSymbol')
    print("stockTickerSymbol:", stockTickerSymbol)
    api_url = f'https://finnhub.io/api/v1/stock/profile2?symbol={stockTickerSymbol}&token={api_key}'
    print("API URL:", api_url)
    if not stockTickerSymbol:
        return jsonify({'error': 'Stock symbol is required'}), 400

    try:
        response = requests.get(api_url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f'error making GET request: {e}')
    if response.status_code == 200:
        data = response.json()
        print(data)
        return data
    else:
        print( 'stocktickerSymbol', {stockTickerSymbol})
        print(f'Error: {response.status_code} - {response.text}')
        return response.text
        # return jsonify({'error': 'Failed to fetch the stock details'}), 500


@app.route('/stockSummary', methods=['GET'])
def get_stock_summary():
    api_key = 'cmu5ht9r01qsv99m22c0cmu5ht9r01qsv99m22cg'
    stockTickerSymbol = request.args.get('stockTickerSymbol')
    print("stockTickerSymbol:", stockTickerSymbol)
    api_url = f'https://finnhub.io/api/v1/quote?symbol={stockTickerSymbol}&token={api_key}'
    print("API URL:", api_url)
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
        print( 'stocktickerSymbol', {stockTickerSymbol})
        print(f'Error: {response.status_code} - {response.text}')
        return response.text
        # return jsonify({'error': 'Failed to fetch the stock details'}), 500


@app.route('/stockrecommendationTrends', methods=['GET'])
def get_stock_recommendation_trends():
    api_key = 'cmu5ht9r01qsv99m22c0cmu5ht9r01qsv99m22cg'
    stockTickerSymbol = request.args.get('stockTickerSymbol')
    print("stockTickerSymbol:", stockTickerSymbol)
    api_url = f'https://finnhub.io/api/v1/stock/recommendation?symbol={stockTickerSymbol}&token={api_key}'
    print("API URL:", api_url)
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
        print( 'stocktickerSymbol', {stockTickerSymbol})
        print(f'Error: {response.status_code} - {response.text}')
        return response.text
        # return jsonify({'error': 'Failed to fetch the stock details'}), 500


@app.route('/companyNews', methods=['GET'])
def get_company_news():
    api_key = 'cmu5ht9r01qsv99m22c0cmu5ht9r01qsv99m22cg'
    stockTickerSymbol = request.args.get('stockTickerSymbol')
    endDate = datetime.now().date()
    startDate = endDate - relativedelta(days=-30)
    print("stockTickerSymbol:", stockTickerSymbol)
    api_url = f'https://finnhub.io/api/v1/company-news?symbol={stockTickerSymbol}&from={startDate}&to={endDate}&token={api_key}'
    print("API URL:", api_url)
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
        print( 'stocktickerSymbol', {stockTickerSymbol})
        print(f'Error: {response.status_code} - {response.text}')
        return response.text
        # return jsonify({'error': 'Failed to fetch the stock details'}), 500



@app.route('/highCharts', methods=['GET'])
def get_stock_highCharts():
    api_key = 'Veu4EyzzJTduRuvf0Y1woy5mwtn1mMIA'
    stockTickerSymbol = request.args.get('stockTickerSymbol')
    endDate = datetime.now().date()
    startDate = endDate - relativedelta(months=6, days=1)
    end_epoch_time = endDate  #int(datetime.combine(endDate, time.min).timestamp())
    start_epoch_time = startDate #int(datetime.combine(startDate, time.min).timestamp())
    multiplier = 1
    timespan = "day"
    print("stockTickerSymbol:", stockTickerSymbol)
    api_url = f'https://api.polygon.io/v2/aggs/ticker/{stockTickerSymbol}/range/{multiplier}/{timespan}/{start_epoch_time}/{end_epoch_time}?adjusted=true&sort=asc&apiKey={api_key}'
    print("API URL:", api_url)
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
        print( 'stocktickerSymbol', {stockTickerSymbol})
        print(f'Error: {response.status_code} - {response.text}')
        return response.text
        # return jsonify({'error': 'Failed to fetch the stock details'}), 500

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)