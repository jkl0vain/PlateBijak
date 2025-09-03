import React, { useState } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Info, Loader2, Car, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { ValidationResult, VehicleData } from '../types/vehicle'

interface ValidationResultsProps {
  results: ValidationResult[]
  isValidating: boolean
  vehicleData: VehicleData
  //newly added for fraud detection
  riskScore?: number | null
  action?: 'allow' | 'review' | 'block' | null
  //onApplySuggestion?: (field: string, suggestion: string) => void
  //onApplyAll?: () => void
  //onSubmitAnyway?: () => void
}

export const ValidationResults: React.FC<ValidationResultsProps> = ({ 
  results, 
  isValidating, 
  vehicleData,
  riskScore,
  action
  
}) => {
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set())

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedResults(newExpanded)
  }

  const getIcon = (type: ValidationResult['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBorderColor = (type: ValidationResult['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'error':
        return 'border-l-red-500 bg-red-50'
      case 'info':
        return 'border-l-blue-500 bg-blue-50'
    }
  }

  const getFieldLabel = (field?: ValidationResult['field']) => {
  const labels: Record<keyof VehicleData, string> = {
      plateNumber: 'Plate Number',
      make: 'Vehicle Make',
      model: 'Model',
      year: 'Year',
      engineCapacity: 'Engine Capacity',
      color: 'Color',
      chassisNumber: 'Chassis Number'
    }
    if (!field) return 'General'
    if (field === 'behavior') return 'Suspicious Behavior'
    return labels[field as keyof VehicleData] ?? 'General'
  }



  const hasData = Object.values(vehicleData).some(value => value.trim() !== '')
  const successCount = results.filter(r => r.type === 'success').length
  const warningCount = results.filter(r => r.type === 'warning').length
  const errorCount = results.filter(r => r.type === 'error').length

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
          
    {/* Header */}
    <div className="flex items-center space-x-3 mb-4">
      <div className="bg-green-100 p-2 rounded-lg">
        <CheckCircle className="h-5 w-5 text-green-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Validation Results</h2>
    </div>

    {/* Risk Badge */}
    {typeof riskScore === 'number' && action && (
      <div
        className={[
          'mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm',
          action === 'allow'
            ? 'bg-green-50 text-green-700 border-green-200'
            : action === 'review'
            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
            : 'bg-red-50 text-red-700 border-red-200'
        ].join(' ')}
      >
        <span className="font-semibold">Risk {riskScore}</span>
        <span className="opacity-60">•</span>
        <span className="uppercase font-semibold">{action}</span>
      </div>
    )}

    {/* Block Warning */}
    {action === 'block' && (
      <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        🚫 We detected high-risk activity. Please verify your details or try again later.
      </div>
    )}

      {isValidating ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Analyzing vehicle data...</p>
            <p className="text-sm text-gray-500 mt-2">Using AI-powered validation algorithms</p>
          </div>
        </div>
      ) : !hasData ? (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No vehicle data to validate</p>
          <p className="text-sm text-gray-500">Enter vehicle information to see validation results</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Waiting for validation</p>
          <p className="text-sm text-gray-500">Click "Validate Vehicle Data" to analyze</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-green-700">Verified</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
              <div className="text-sm text-yellow-700">Warnings</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-red-700">Errors</div>
            </div>
          </div>

          {/* Validation Results */}
          <div className="space-y-4">
            {results.map((result, index) => {
              const isExpanded = expandedResults.has(index)
              const hasDetails = result.reason || result.details?.length

              return (
                <div
                  key={index}
                  className={`border-l-4 rounded-r-lg ${getBorderColor(result.type)}`}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {getIcon(result.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">
                            {getFieldLabel(result.field)}
                          </h4>
                          <div className="flex items-center space-x-2">
                          {typeof result.confidence === 'number' && (
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                              {Math.round(result.confidence * 100)}% confidence
                            </span>
                          )}
                          {hasDetails && (
                            <button
                              onClick={() => toggleExpanded(index)}
                              className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                        </div>
                        
                        <p className="text-gray-700 mb-2">{result.message}</p>
                        
                        {/*
                        {result.suggestion && (
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm text-gray-600 bg-white p-2 rounded border flex-1">
                            💡 Suggested: {result.suggestion}
                          </p>
                          {onApplySuggestion && (
                            <button
                              onClick={() => onApplySuggestion(result.field!, result.suggestion!)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                        )}*/}

                        {result.suggestion && (
                          <p className="text-sm text-gray-600 bg-white p-2 rounded border mb-2">
                            💡 {result.suggestion}
                          </p>
                        )}


                        {/* Expandable Details Section */}
                        {hasDetails && isExpanded && (
                          <div className="mt-3 p-3 bg-white rounded border">
                            {result.reason && (
                              <div className="mb-3">
                                <h5 className="text-sm font-medium text-gray-800 mb-1">Why this occurred:</h5>
                                <p className="text-sm text-gray-600">{result.reason}</p>
                              </div>
                            )}
                            
                            {result.details && result.details.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-800 mb-2">Additional details:</h5>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {result.details.map((detail, detailIndex) => (
                                    <li key={detailIndex} className="flex items-start">
                                      <span className="text-gray-400 mr-2">•</span>
                                      <span>{detail}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/*<div className="mt-6 flex gap-3">
          {onApplyAll && results.some(r => r.suggestion) && (
            <button
              onClick={onApplyAll}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Fix All
            </button>
          )}
          {onSubmitAnyway && (
            <button
              onClick={onSubmitAnyway}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Submit Anyway (Review)
            </button>
          )}
        </div>
          */}

          {/* Overall Status */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Overall Status</h4>
                <p className="text-sm text-gray-600">
                  {errorCount === 0 
                    ? warningCount === 0 
                      ? "✅ All data validated successfully"
                      : "⚠️ Minor issues detected - review warnings"
                    : "❌ Critical errors found - please correct before proceeding"
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Processing Time</div>
                <div className="font-medium text-gray-900">1.2s</div>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <Info className="h-4 w-4 inline mr-1" />
              Click the expand button (↓) on any result to see detailed explanations and reasons for validation outcomes.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
