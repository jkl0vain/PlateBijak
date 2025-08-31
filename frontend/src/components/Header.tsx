import React from 'react'
import { Shield, BarChart3, Car } from 'lucide-react'

interface HeaderProps {
  currentView: 'form' | 'dashboard'
  onViewChange: (view: 'form' | 'dashboard') => void
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BJAK</h1>
              <p className="text-sm text-gray-500">Vehicle Validation System</p>
            </div>
          </div>
          
          <nav className="flex space-x-1">
            <button
              onClick={() => onViewChange('form')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'form'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Car className="h-4 w-4" />
              <span>Validation</span>
            </button>
            
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
