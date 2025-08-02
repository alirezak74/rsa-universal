import React, { useState, useEffect } from 'react';

interface Market {
  pair: string;
  price: string;
  change: string;
  volume: string;
}

const MarketTable = () => {
  const [markets, setMarkets] = useState<Market[]>([]);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        // In a real app, you'd fetch this from the RSA indexer
        // const response = await fetch(`${process.env.NEXT_PUBLIC_RSA_INDEXER_URL}/markets`);
        // const data = await response.json();
        const mockMarkets: Market[] = [
          { pair: 'RSA/USD', price: '0.85', change: '+2.5%', volume: '1.2M' }, // Updated RSA price to $0.85
          { pair: 'BTC/USD', price: '65,432', change: '-1.2%', volume: '2.5B' },
          { pair: 'ETH/USD', price: '3,456', change: '+0.8%', volume: '1.8B' },
        ];
        setMarkets(mockMarkets);
      } catch (error) {
        console.error('Error fetching markets:', error);
      }
    };
    fetchMarkets();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Markets</h2>
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-500 dark:text-gray-400">
            <th className="py-2">Pair</th>
            <th className="py-2">Price</th>
            <th className="py-2">Change</th>
            <th className="py-2">Volume</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((market) => (
            <tr key={market.pair} className="border-t border-gray-200 dark:border-gray-700">
              <td className="py-4 text-gray-900 dark:text-white">{market.pair}</td>
              <td className="py-4 text-gray-900 dark:text-white">{market.price}</td>
              <td className={`py-4 ${market.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {market.change}
              </td>
              <td className="py-4 text-gray-600 dark:text-gray-400">{market.volume}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarketTable;
