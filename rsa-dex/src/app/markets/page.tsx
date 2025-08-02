"use client";

import { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, RefreshCw, Star, Filter } from "lucide-react";
import Header from "@/components/Header";
import { useTradingStore } from "@/store/tradingStore";
import { Asset, TradingPair } from "@/types";
import Link from "next/link";

export default function MarketsPage() {
  const {
    assets,
    tradingPairs,
    loading,
    error,
    syncAssetsFromAdmin,
    syncPrices,
    setCurrentPair,
  } = useTradingStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"volume" | "change" | "price" | "name">("volume");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState<"all" | "crypto" | "token">("all");
  const [favorites, setFavorites] = useState<string[]>([]);

  // Sync assets on component mount
  useEffect(() => {
    syncAssetsFromAdmin();
    
    // Set up price sync interval
    const priceInterval = setInterval(() => {
      syncPrices();
    }, 10000); // Update prices every 10 seconds

    return () => clearInterval(priceInterval);
  }, [syncAssetsFromAdmin, syncPrices]);

  // Filter and sort assets
  const filteredAssets = assets
    .filter((asset) => {
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "all" || asset.type === filterType;
      
      return matchesSearch && matchesType && asset.status === "active";
    })
    .sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;
      
      switch (sortBy) {
        case "volume":
          aValue = a.metadata?.volume24h || 0;
          bValue = b.metadata?.volume24h || 0;
          break;
        case "change":
          aValue = a.metadata?.change24h || 0;
          bValue = b.metadata?.change24h || 0;
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        default:
          aValue = a.metadata?.volume24h || 0;
          bValue = b.metadata?.volume24h || 0;
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortOrder === "asc" 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const formatChange = (change: number) => {
    const formatted = Math.abs(change).toFixed(2);
    return `${change >= 0 ? '+' : '-'}${formatted}%`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  const handleTradeClick = (asset: Asset) => {
    // Find a trading pair with this asset
    const pair = tradingPairs.find(p => 
      p.baseAsset === asset.symbol || p.quoteAsset === asset.symbol
    );
    
    if (pair) {
      setCurrentPair(pair.symbol);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Markets
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Trade cryptocurrencies and tokens on RSA DEX
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button
                onClick={() => {
                  syncAssetsFromAdmin();
                  syncPrices();
                }}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-yellow-800">
                  <strong>Note:</strong> {error}
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="crypto">Crypto</option>
                    <option value="token">Tokens</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="volume">Volume</option>
                    <option value="change">24h Change</option>
                    <option value="price">Price</option>
                    <option value="name">Name</option>
                  </select>
                </div>

                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>

          {/* Markets Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      24h Change
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      24h Volume
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Market Cap
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading && filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                          <span className="text-gray-500 dark:text-gray-400">Loading markets...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          No assets found matching your search criteria
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => {
                      const change24h = asset.metadata?.change24h || 0;
                      const volume24h = asset.metadata?.volume24h || 0;
                      const marketCap = asset.metadata?.marketCap || 0;
                      const ChangeIcon = getChangeIcon(change24h);
                      const isFavorite = favorites.includes(asset.symbol);

                      return (
                        <tr
                          key={asset.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <button
                                onClick={() => toggleFavorite(asset.symbol)}
                                className="mr-3 text-gray-400 hover:text-yellow-500 transition-colors"
                              >
                                <Star 
                                  className={`w-4 h-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`}
                                />
                              </button>
                              
                              <div className="flex items-center">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-600 mr-3 text-lg">
                                  {asset.icon}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {asset.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {asset.symbol}
                                    {asset.type === 'token' && (
                                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                        Token
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 text-right">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {formatPrice(asset.price)}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 text-right">
                            <div className={`flex items-center justify-end ${getChangeColor(change24h)}`}>
                              <ChangeIcon className="w-4 h-4 mr-1" />
                              <span className="font-medium">
                                {formatChange(change24h)}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 text-right">
                            <div className="text-gray-900 dark:text-white">
                              {formatVolume(volume24h)}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 text-right">
                            <div className="text-gray-900 dark:text-white">
                              {marketCap > 0 ? formatVolume(marketCap) : 'N/A'}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Link 
                                href="/exchange"
                                onClick={() => handleTradeClick(asset)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                Trade
                              </Link>
                              
                              {asset.visibilitySettings.contracts && asset.contractAddress && (
                                <a
                                  href={asset.metadata?.explorer}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                                >
                                  Explorer
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trading Pairs Summary */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Popular Trading Pairs
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tradingPairs.slice(0, 6).map((pair) => (
                <Link
                  key={pair.symbol}
                  href="/exchange"
                  onClick={() => setCurrentPair(pair.symbol)}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {pair.symbol}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {pair.baseAsset}/{pair.quoteAsset}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {pair.price.toFixed(6)}
                      </div>
                      <div className={`text-sm ${getChangeColor(pair.change24h)}`}>
                        {formatChange(pair.change24h)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
