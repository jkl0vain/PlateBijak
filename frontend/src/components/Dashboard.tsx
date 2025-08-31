import React from 'react'
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react'

export const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Validations',
      value: '12,847',
      change: '+12.5%',
      trend: 'up',
      icon: BarChart3,
      color: 'blue'
    },
    {
      title: 'Success Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Avg Processing Time',
      value: '1.3s',
      change: '-0.2s',
      trend: 'up',
      icon: Clock,
      color: 'purple'
    },
    {
      title: 'Active Users',
      value: '2,341',
      change: '+8.7%',
      trend: 'up',
      icon: Users,
      color: 'orange'
    }
  ]

  const commonErrors = [
    { field: 'Plate Number', count: 234, description: 'Invalid format or typos' },
    { field: 'Vehicle Make', count: 189, description: 'Misspelled manufacturer names' },
    { field: 'Year', count: 156, description: 'Out of range values' },
    { field: 'Chassis Number', count: 98, description: 'Incorrect VIN format' },
    { field: 'Engine Capacity', count: 67, description: 'Unrealistic values' }
  ]

  const recentValidations = [
    { id: 1, plate: 'ABC 1234', make: 'Toyota', status: 'success', time: '2 min ago' },
    { id: 2, plate: 'XYZ 5678', make: 'Honda', status: 'warning', time: '5 min ago' },
    { id: 3, plate: 'DEF 9012', make: 'Nissan', status: 'success', time: '8 min ago' },
    { id: 4, plate: 'GHI 3456', make: 'BMW', status: 'error', time: '12 min ago' },
    { id: 5, plate: 'JKL 7890', make: 'Mercedes', status: 'success', time: '15 min ago' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Monitor validation performance and system insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${getStatColor(stat.color)}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                {stat.change}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Common Errors */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Common Validation Errors</h2>
          </div>
          
          <div className="space-y-4">
            {commonErrors.map((error, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{error.field}</div>
                  <div className="text-sm text-gray-600">{error.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">{error.count}</div>
                  <div className="text-xs text-gray-500">errors</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Validations */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Validations</h2>
          </div>
          
          <div className="space-y-3">
            {recentValidations.map((validation) => (
              <div key={validation.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="font-medium text-gray-900">{validation.plate}</div>
                    <div className="text-sm text-gray-600">{validation.make}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(validation.status)}`}>
                    {validation.status}
                  </span>
                  <span className="text-sm text-gray-500">{validation.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Validation Performance Trends</h2>
        <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Performance chart visualization</p>
            <p className="text-sm text-gray-500">Real-time analytics and trends</p>
          </div>
        </div>
      </div>
    </div>
  )
}
