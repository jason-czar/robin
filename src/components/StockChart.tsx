import React, { useState, useEffect } from 'react';
import { LineChart, Line, YAxis, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { format } from 'date-fns';
import { Settings } from 'lucide-react';
import { fetchStockData } from '../services/api';

interface StockData {
  datetime: string;
  price: number;
}

const intervals = ['1D', '1W', '1M', '3M', 'YTD', '1Y', '5Y', 'MAX'];

export default function StockChart() {
  const [data, setData] = useState<StockData[]>([]);
  const [currentInterval, setCurrentInterval] = useState('1D');
  const [hoveredData, setHoveredData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const stockData = await fetchStockData('NVDA');
        setData(stockData);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
      setIsLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [currentInterval]);

  const currentPrice = data[data.length - 1]?.price || 0;
  const openPrice = data[0]?.price || 0;
  const priceChange = currentPrice - openPrice;
  const percentageChange = (priceChange / openPrice) * 100;
  const isPositive = priceChange >= 0;

  const handleMouseMove = (e: any) => {
    if (e.activePayload) {
      setHoveredData(e.activePayload[0].payload);
    }
  };

  const handleMouseLeave = () => {
    setHoveredData(null);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">NVIDIA</h1>
            <div className="text-4xl font-bold mb-2">
              ${hoveredData ? hoveredData.price.toFixed(2) : currentPrice.toFixed(2)}
            </div>
            <div className={`text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              ${Math.abs(priceChange).toFixed(2)} ({Math.abs(percentageChange).toFixed(2)}%)
              {isPositive ? ' ↑' : ' ↓'}
              <span className="text-gray-400 ml-2">Today</span>
            </div>
          </div>
          <button className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700">
            Advanced
          </button>
        </div>

        <div className="h-[400px] relative mb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                <YAxis domain={['dataMin', 'dataMax']} hide />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#ff5000"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                {hoveredData && (
                  <ReferenceLine
                    x={hoveredData.datetime}
                    stroke="#666"
                    strokeDasharray="3 3"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            {intervals.map((interval) => (
              <button
                key={interval}
                className={`px-4 py-1 rounded-md ${
                  currentInterval === interval
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
                onClick={() => setCurrentInterval(interval)}
              >
                {interval}
              </button>
            ))}
          </div>
          <button className="p-2 hover:bg-gray-800 rounded-full">
            <Settings className="w-6 h-6 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}