export interface VehicleData {
  plateNumber: string
  make: string
  model: string
  year: string
  engineCapacity: string
  color: string
  chassisNumber: string
}

export type ValidationField = keyof VehicleData | 'behavior'

export interface ValidationResult {
  field?: ValidationField
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  suggestion?: string
  confidence?: number
  reason?: string
  details?: string[]
}

export interface ValidationStats {
  totalValidations: number
  successRate: number
  commonErrors: Array<{
    field: string
    count: number
    description: string
  }>
  processingTime: number
}
