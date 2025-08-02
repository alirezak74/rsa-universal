'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Mail, Calendar, Shield, CheckCircle, XCircle, Clock, Eye, Download, Upload, AlertTriangle, FileText, UserCheck, UserX } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email?: string;
  status: 'active' | 'inactive' | 'suspended';
  role: string;
  createdAt: string;
  lastLogin?: string;
  totalOrders?: number;
  totalTrades?: number;
  kycStatus?: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  kycDocuments?: KYCDocument[];
}

interface KYCDocument {
  id: string;
  userId: string;
  type: 'identity' | 'address' | 'selfie' | 'proof_of_funds';
  filename: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  notes?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <p className="text-sm text-gray-900">{user.username}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-sm text-gray-900">{user.email || 'N/A'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID</label>
            <p className="text-sm text-gray-900">{user.id}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="text-sm text-gray-900 capitalize">{user.role}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user.status === 'active' ? 'bg-green-100 text-green-800' : 
              user.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Orders</label>
            <p className="text-sm text-gray-900">{user.totalOrders || 0}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Trades</label>
            <p className="text-sm text-gray-900">{user.totalTrades || 0}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Joined</label>
            <p className="text-sm text-gray-900">{new Date(user.createdAt).toLocaleString()}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Login</label>
            <p className="text-sm text-gray-900">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'kyc'>('users');
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycNotes, setKycNotes] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/api/admin/users', { page: 1, limit: 100 });
      
      if (response.success && response.data && typeof response.data === 'object' && 'data' in response.data) {
        setUsers((response.data as any).data);
      } else if (response.success && Array.isArray(response.data)) {
        // Fallback for direct array response
        setUsers(response.data);
      } else {
        // Create mock users if endpoint not available
        const mockUsers: User[] = [
          {
            id: '1',
            username: 'admin',
            email: 'admin@rsachain.com',
            status: 'active',
            role: 'admin',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            totalOrders: 0,
            totalTrades: 0
          },
          {
            id: '2',
            username: 'user1',
            email: 'user1@example.com',
            status: 'active',
            role: 'user',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            lastLogin: new Date(Date.now() - 3600000).toISOString(),
            totalOrders: 5,
            totalTrades: 3
          }
        ];
        setUsers(mockUsers);
      }
    } catch (error: any) {
      console.error('Users fetch error:', error);
      // Create mock users as fallback
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@rsachain.com',
          status: 'active',
          role: 'admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          totalOrders: 0,
          totalTrades: 0
        }
      ];
      setUsers(mockUsers);
      setError('Using mock data - backend may not be available');
      toast.error('Failed to load users - using mock data');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const response = await apiClient.get('/api/admin/users', { page: 1, limit: 100 });
        if (response.success && response.data && typeof response.data === 'object' && 'data' in response.data) {
          setUsers((response.data as any).data);
        } else if (response.success && Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          const mockUsers: User[] = [
            {
              id: '1',
              username: 'admin',
              email: 'admin@rsachain.com',
              status: 'active',
              role: 'admin',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              totalOrders: 0,
              totalTrades: 0
            },
            {
              id: '2',
              username: 'user1',
              email: 'user1@example.com',
              status: 'active',
              role: 'user',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              lastLogin: new Date(Date.now() - 3600000).toISOString(),
              totalOrders: 5,
              totalTrades: 3
            }
          ];
          setUsers(mockUsers);
        }
      } else {
        const response = await apiClient.get('/api/admin/kyc-documents', { page: 1, limit: 100 });
        if (response.success && response.data && typeof response.data === 'object' && 'data' in response.data) {
          setKycDocuments((response.data as any).data);
        } else if (response.success && Array.isArray(response.data)) {
          setKycDocuments(response.data);
        } else {
          const mockDocs: KYCDocument[] = [
            {
              id: 'doc1',
              userId: '1',
              type: 'identity',
              filename: 'id_card.jpg',
              status: 'pending',
              uploadedAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: 'doc2',
              userId: '2',
              type: 'address',
              filename: 'utility_bill.pdf',
              status: 'approved',
              uploadedAt: new Date(Date.now() - 86400000).toISOString()
            }
          ];
          setKycDocuments(mockDocs);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@rsachain.com',
          status: 'active',
          role: 'admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          totalOrders: 0,
          totalTrades: 0
        }
      ];
      setUsers(mockUsers);
      setError('Using mock data - backend may not be available');
      toast.error('Failed to load users - using mock data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const response = await apiClient.put(`/api/admin/users/${userId}/status`, { status: newStatus });
      
      if (response.success) {
        toast.success(`User status updated to ${newStatus}`);
        
        // Update the user status locally for immediate feedback
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, status: newStatus as 'active' | 'inactive' | 'suspended' }
              : user
          )
        );
        
        // Don't refresh from server to maintain local state
        // setTimeout(() => fetchUsers(), 1000);
      } else {
        toast.error(response.error || 'Failed to update user status');
      }
    } catch (error: any) {
      console.error('Update user status error:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleKycReview = async (documentId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await apiClient.put(`/api/admin/kyc-documents/${documentId}/review`, { status, notes: kycNotes });
      
      if (response.success) {
        setKycDocuments(prev => prev.map(doc => 
          doc.id === documentId ? { ...doc, status, notes: kycNotes } : doc
        ));
        setShowKycModal(false);
        setKycNotes('');
      } else {
        toast.error(response.error || 'Failed to review KYC document');
      }
    } catch (error: any) {
      console.error('Failed to review KYC document:', error);
      toast.error('Failed to review KYC document');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <UserCheck className="h-4 w-4 text-green-500" />
      case 'rejected': return <UserX className="h-4 w-4 text-red-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'not_submitted': return <AlertTriangle className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'identity': return <User className="h-4 w-4" />
      case 'address': return <FileText className="h-4 w-4" />
      case 'selfie': return <Eye className="h-4 w-4" />
      case 'proof_of_funds': return <Shield className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts and KYC verification</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('kyc')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'kyc'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              KYC/AML Verification
            </button>
          </nav>
        </div>

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">User Accounts</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(user.status)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">{user.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getKycStatusIcon(user.kycStatus || 'not_submitted')}
                          <span className="ml-2 text-sm text-gray-900 capitalize">
                            {user.kycStatus?.replace('_', ' ') || 'not submitted'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={user.status}
                          onChange={(e) => handleUserStatusChange(user.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="pending">Pending</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'kyc' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">KYC/AML Document Verification</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kycDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">User {doc.userId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getDocumentTypeIcon(doc.type)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">{doc.type.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getKycStatusIcon(doc.status)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">{doc.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(doc.uploadedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(users.find(u => u.id === doc.userId) || null)
                              setShowKycModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Review
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KYC Review Modal */}
        {showKycModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Review KYC Document</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes</label>
                  <textarea
                    value={kycNotes}
                    onChange={(e) => setKycNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter review notes..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowKycModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleKycReview('doc_id', 'rejected')}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleKycReview('doc_id', 'approved')}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                User Management
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  View user details, suspend problematic users, and reactivate suspended accounts. All actions are logged for audit purposes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Modal */}
        <UserModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          user={selectedUser}
        />
      </div>
    </Layout>
  );
} 