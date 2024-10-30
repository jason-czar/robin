import axios from 'axios';

const API_KEY = 'bc36863033bc47de8aaddf2848bc09d4';
const BASE_URL = 'https://api.twelvedata.com';

export async function fetchStockData(symbol: string) {
  try {
    const response = await axios.get(`${BASE_URL}/time_series`, {
      params: {
        symbol,
        interval: '5min',
        apikey: API_KEY,
        format: 'JSON',
        outputsize: 100,
      },
    });

    return response.data.values.map((item: any) => ({
      datetime: item.datetime,
      price: parseFloat(item.close),
    })).reverse();
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return [];
  }
}