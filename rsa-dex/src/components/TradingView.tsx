'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
}

const TradingView = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trend, setTrend] = useState(0.1);
  const [momentum, setMomentum] = useState(1);

  const generateChartData = useCallback((): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const now = new Date();
    let currentPrice = 0.85; // Base RSA price
    
    // Generate 20 data points
    for (let i = 19; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3000);
      
      // Create realistic price movement
      const randomWalk = (Math.random() - 0.5) * 0.02;
      const trendInfluence = trend * 0.001;
      const volatility = 0.005 + Math.abs(Math.sin(i * 0.1)) * 0.01;
      
      currentPrice += (randomWalk + trendInfluence) * momentum;
      currentPrice = Math.max(0.01, currentPrice); // Prevent negative prices
      
      data.push({
        time: time.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }),
        price: parseFloat(currentPrice.toFixed(4)),
        volume: Math.floor(Math.random() * 10000) + 5000
      });
    }
    
    return data;
  }, [trend, momentum]);

  useEffect(() => {
    // Initial data load
    setChartData(generateChartData());
    setIsLoading(false);

    // Update chart every 3 seconds with smooth animation
    const interval = setInterval(() => {
      // Gradually change trend and momentum for realistic market behavior
      setTrend(prev => prev + (Math.random() - 0.5) * 0.1);
      setMomentum(prev => Math.max(0.5, Math.min(2.0, prev + (Math.random() - 0.5) * 0.2)));
      
      setChartData(generateChartData());
    }, 3000);

    return () => clearInterval(interval);
  }, [generateChartData]);

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 animate-spin text-blue-400" />
            <span className="text-gray-300">Loading chart data...</span>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = chartData[chartData.length - 1]?.price || 0.85;
  const openPrice = chartData[0]?.price || 0.85;
  const priceChange = currentPrice - openPrice;
  const priceChangePercent = (priceChange / openPrice) * 100;

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">RSA/USD</h3>
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-2xl font-bold text-white">
              ${currentPrice.toFixed(4)}
            </span>
            <div className={`flex items-center space-x-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(4)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="flex items-center space-x-1 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Live</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Open: ${openPrice.toFixed(4)}</div>
          <div className="text-sm text-gray-400">Points: {chartData.length}</div>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
            />
            <YAxis 
              domain={['dataMin - 0.01', 'dataMax + 0.01']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                color: '#F9FAFB'
              }}
              formatter={(value: any) => [`$${parseFloat(value).toFixed(4)}`, 'Price']}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ 
                r: 6, 
                stroke: '#3B82F6', 
                strokeWidth: 2, 
                fill: '#1F2937' 
              }}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TradingView;