'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api';
import { ORDER_STATUS, ORDER_TYPES, ORDER_SIDES } from '@/config/settings';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  amount: number;
  price?: number;
  status: string;
  createdAt: string;
  userId?: string;
  filledAmount?: number;
  remainingAmount?: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: '',
    side: '',
    type: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 20 seconds for real-time order updates
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/api/admin/orders', { 
        page: 1, 
        limit: 100,
        ...(filter.status && { status: filter.status }),
        ...(filter.side && { side: filter.side }),
        ...(filter.type && { type: filter.type })
      });
      
      if (response.success && response.data && typeof response.data === 'object' && 'data' in response.data) {
        setOrders((response.data as any).data);
      } else if (response.success && Array.isArray(response.data)) {
        // Fallback for old response format
        setOrders(response.data);
      } else {
        setError('Failed to load orders');
        toast.error('Failed to load orders');
      }
    } catch (error: any) {
      console.error('Orders fetch error:', error);
      setError('Failed to load orders. Please check if the RSA DEX backend is running.');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const response = await apiClient.delete(`/api/orders/${orderId}`);
      
      if (response.success) {
        toast.success('Order cancelled successfully');
        fetchOrders(); // Refresh the list
      } else {
        toast.error(response.error || 'Failed to cancel order');
      }
    } catch (error: any) {
      console.error('Cancel order error:', error);
      toast.error('Failed to cancel order');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter.status && order.status !== filter.status) return false;
    if (filter.side && order.side !== filter.side) return false;
    if (filter.type && order.type !== filter.type) return false;
    return true;
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(amount);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'filled':
        return 'bg-green-100 text-green-800';
      case 'partially_filled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSideColor = (side: string) => {
    return side === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="" className="text-gray-900">All Statuses</option>
                {Object.values(ORDER_STATUS).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Side</label>
              <select
                value={filter.side}
                onChange={(e) => setFilter(prev => ({ ...prev, side: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="" className="text-gray-900">All Sides</option>
                {Object.values(ORDER_SIDES).map(side => (
                  <option key={side} value={side} className="text-gray-900">
                    {side.charAt(0).toUpperCase() + side.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filter.type}
                onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value="" className="text-gray-900">All Types</option>
                {Object.values(ORDER_TYPES).map(type => (
                  <option key={type} value={type} className="text-gray-900">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading orders...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-red-800">{error}</div>
            <div className="text-red-600 text-sm mt-2">
              Make sure the RSA DEX backend is running on http://localhost:8000
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Orders List</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pair</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.pair}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getSideColor(order.side)}`}>{order.side}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatAmount(order.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.price ? formatPrice(order.price) : '-'}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatusColor(order.status)}`}>{order.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(order.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            onClick={() => { setEditOrder(order); setShowEditModal(true); }}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center text-gray-500">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Edit Order Modal */}
        {showEditModal && editOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Edit Order</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const response = await apiClient.put(`/api/orders/${editOrder.id}`, {
                      amount: editOrder.amount,
                      price: editOrder.price,
                      type: editOrder.type,
                      status: editOrder.status
                    });
                    
                    if (response.success) {
                      toast.success('Order updated successfully');
                      
                      // Update the order locally for immediate feedback
                      setOrders(prevOrders =>
                        prevOrders.map(order =>
                          order.id === editOrder.id
                            ? {
                                ...order,
                                amount: editOrder.amount,
                                price: editOrder.price,
                                type: editOrder.type,
                                status: editOrder.status
                              }
                            : order
                        )
                      );
                      
                      setShowEditModal(false);
                      setEditOrder(null);
                    } else {
                      toast.error(response.error || 'Failed to update order');
                    }
                  } catch (error: any) {
                    console.error('Update order error:', error);
                    toast.error('Failed to update order');
                  }
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editOrder.amount}
                    onChange={e => setEditOrder({ ...editOrder, amount: parseFloat(e.target.value) || 0 })}
                    style={{ color: '#000' }}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.000001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editOrder.price || ''}
                    onChange={e => setEditOrder({ ...editOrder, price: parseFloat(e.target.value) || 0 })}
                    style={{ color: '#000' }}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    value={editOrder.status}
                    onChange={e => setEditOrder({ ...editOrder, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="filled">Filled</option>
                    <option value="partially_filled">Partially Filled</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    onClick={() => { setShowEditModal(false); setEditOrder(null); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 