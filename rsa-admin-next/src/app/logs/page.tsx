'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Download, RefreshCw, AlertTriangle, Info, CheckCircle, XCircle, Bell, Mail, MessageSquare, Zap, Shield, DollarSign, User, Clock } from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  category: 'system' | 'auth' | 'trading' | 'api' | 'database' | 'security' | 'notification' | 'alert'
  message: string
  userId?: string
  details?: any
}

interface Notification {
  id: string
  type: 'email' | 'sms' | 'push' | 'in-app'
  recipient: string
  subject: string
  message: string
  status: 'pending' | 'sent' | 'failed'
  createdAt: string
  sentAt?: string
}

interface Alert {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: 'security' | 'transaction' | 'system' | 'user'
  title: string
  message: string
  acknowledged: boolean
  createdAt: string
  acknowledgedAt?: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [activeTab, setActiveTab] = useState<'logs' | 'notifications' | 'alerts'>('logs')
  const [loading, setLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'logs') {
        const response = await fetch('http://localhost:8001/api/dev/admin/logs')
        if (response.ok) {
          const data = await response.json()
          setLogs(data.logs || [])
        }
      } else if (activeTab === 'notifications') {
        const response = await fetch('http://localhost:8001/api/dev/admin/notifications')
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
        }
      } else {
        const response = await fetch('http://localhost:8001/api/dev/admin/alerts')
        if (response.ok) {
          const data = await response.json()
          setAlerts(data.alerts || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // Generate mock data
      if (activeTab === 'logs') {
        setLogs(generateMockLogs())
      } else if (activeTab === 'notifications') {
        setNotifications(generateMockNotifications())
      } else {
        setAlerts(generateMockAlerts())
      }
    } finally {
      setLoading(false)
    }
  }

  const generateMockLogs = (): LogEntry[] => [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      level: 'info',
      category: 'system',
      message: 'System startup completed successfully'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      level: 'warning',
      category: 'security',
      message: 'Multiple failed login attempts detected'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      level: 'success',
      category: 'trading',
      message: 'Large trade executed: 1000 RSA for 850 USDT'
    }
  ]

  const generateMockNotifications = (): Notification[] => [
    {
      id: '1',
      type: 'email',
      recipient: 'admin@rsachain.com',
      subject: 'Large Transaction Alert',
      message: 'A transaction of $50,000 has been processed',
      status: 'sent',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      sentAt: new Date(Date.now() - 3599000).toISOString()
    },
    {
      id: '2',
      type: 'push',
      recipient: 'admin',
      subject: 'System Status',
      message: 'All systems are operating normally',
      status: 'sent',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      sentAt: new Date(Date.now() - 7199000).toISOString()
    }
  ]

  const generateMockAlerts = (): Alert[] => [
    {
      id: '1',
      severity: 'high',
      type: 'security',
      title: 'Suspicious Activity Detected',
      message: 'Multiple failed login attempts from IP 192.168.1.100',
      acknowledged: false,
      createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: '2',
      severity: 'medium',
      type: 'transaction',
      title: 'Large Withdrawal Request',
      message: 'User requested withdrawal of $25,000',
      acknowledged: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      acknowledgedAt: new Date(Date.now() - 3500000).toISOString()
    }
  ]

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`http://localhost:8001/api/dev/admin/alerts/${alertId}/acknowledge`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, acknowledged: true, acknowledgedAt: new Date().toISOString() }
            : alert
        ))
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
      // Update locally for demo
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true, acknowledgedAt: new Date().toISOString() }
          : alert
      ))
    }
  }

  const handleSendNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`http://localhost:8001/api/dev/admin/notifications/${notificationId}/send`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'sent', sentAt: new Date().toISOString() }
            : notif
        ))
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
      default: return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="h-4 w-4" />
      case 'trading': return <DollarSign className="h-4 w-4" />
      case 'system': return <Zap className="h-4 w-4" />
      case 'user': return <User className="h-4 w-4" />
      case 'notification': return <Bell className="h-4 w-4" />
      case 'alert': return <AlertTriangle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-200'
      case 'high': return 'bg-orange-100 border-orange-200'
      case 'medium': return 'bg-yellow-100 border-yellow-200'
      case 'low': return 'bg-blue-100 border-blue-200'
      default: return 'bg-gray-100 border-gray-200'
    }
  }

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'push': return <Bell className="h-4 w-4" />
      case 'in-app': return <Info className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const filteredLogs = logs.filter(log => {
    const matchesCategory = !categoryFilter || log.category === categoryFilter
    const matchesLevel = !levelFilter || log.level === levelFilter
    const matchesSearch = !searchTerm || log.message.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesLevel && matchesSearch
  })

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">System Logs & Notifications</h1>
          <p className="text-gray-600">Monitor system logs, notifications, and alerts</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              System Logs
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Alerts
            </button>
          </nav>
        </div>

        {/* Filters */}
        {activeTab === 'logs' && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="system">System</option>
                  <option value="auth">Authentication</option>
                  <option value="trading">Trading</option>
                  <option value="api">API</option>
                  <option value="database">Database</option>
                  <option value="security">Security</option>
                  <option value="notification">Notification</option>
                  <option value="alert">Alert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="success">Success</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchData}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getLevelIcon(log.level)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">{log.level}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getCategoryIcon(log.category)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">{log.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.userId || 'System'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <tr key={notification.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getNotificationTypeIcon(notification.type)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">{notification.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {notification.recipient}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {notification.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          notification.status === 'sent' ? 'bg-green-100 text-green-800' :
                          notification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {notification.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(notification.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {notification.status === 'pending' && (
                          <button
                            onClick={() => handleSendNotification(notification.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Send
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alerts.map((alert) => (
                    <tr key={alert.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getCategoryIcon(alert.type)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">{alert.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {alert.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {alert.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          alert.acknowledged ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.acknowledged ? 'Acknowledged' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(alert.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Acknowledge
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Logs & Notifications Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Monitor system logs, track notifications, and manage alerts. All events are logged in real-time for security and debugging purposes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 