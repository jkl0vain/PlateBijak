import React, { useState, useEffect, useRef } from 'react'
import { Car, Loader2, Zap, Camera } from 'lucide-react'
import { VehicleData } from '../types/vehicle'
import { PlateScanner } from './PlateScanner'
import { normalizePlate, isValidPlate } from '../utils/plate'

interface VehicleFormProps {
  onValidate: (data: VehicleData) => void
  isValidating: boolean
  initialData: VehicleData
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  onValidate,
  isValidating,
  initialData
}) => {
  const [formData, setFormData] = useState<VehicleData>(initialData)
  const [realTimeValidation, setRealTimeValidation] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const debounceRef = useRef<number | undefined>(undefined)

  useEffect(() => { setFormData(initialData) }, [initialData])

  const handleInputChange = (field: keyof VehicleData, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)

    if (realTimeValidation && value.length > 2) {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
      debounceRef.current = window.setTimeout(() => onValidate(newData), 500)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onValidate(formData)
  }

  const inputClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Car className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Vehicle Information</h2>
        </div>

        <div className="flex items-center space-x-2">
          <Zap className={`h-4 w-4 ${realTimeValidation ? 'text-green-500' : 'text-gray-400'}`} />
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={realTimeValidation}
              onChange={(e) => setRealTimeValidation(e.target.checked)}
              className="sr-only"
            />
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${realTimeValidation ? 'bg-green-500' : 'bg-gray-300'
              }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${realTimeValidation ? 'translate-x-6' : 'translate-x-1'
                }`} />
            </div>
            <span className="ml-2 text-sm text-gray-600">Real-time</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {/* Plate Number Section */}
          <div>
            {/* Label row with camera + upload */}
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Plate Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {/* Camera Button */}
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  title="Scan with camera"
                  className="p-2 rounded-lg border hover:bg-gray-50"
                >
                  <Camera className="h-5 w-5" />
                </button>

                {/* Upload Button */}
                <label className="px-3 py-1 rounded-lg border hover:bg-gray-50 cursor-pointer text-sm">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = URL.createObjectURL(file);
                      const { default: Tesseract } = await import("tesseract.js");
                      const {
                        data: { text },
                      } = await Tesseract.recognize(url, "eng", {
                        tessedit_char_whitelist:
                          "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ",
                      } as any);
                      handleInputChange("plateNumber", normalizePlate(text));
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Input field full width below */}
            <input
              type="text"
              value={formData.plateNumber}
              onChange={(e) => handleInputChange('plateNumber', e.target.value)}
              placeholder="e.g., ABC 1234"
              className={inputClasses}
              required
            />
          </div>

          {/* Vehicle Make Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Make <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.make}
              onChange={(e) => handleInputChange('make', e.target.value)}
              placeholder="e.g., Toyota"
              className={inputClasses}
              required
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model *
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              placeholder="e.g., Camry"
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year of Manufacture *
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => handleInputChange('year', e.target.value)}
              placeholder="e.g., 2020"
              min="1900"
              max="2025"
              className={inputClasses}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Engine Capacity (L)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.engineCapacity}
              onChange={(e) => handleInputChange('engineCapacity', e.target.value)}
              placeholder="e.g., 2.0"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              placeholder="e.g., White"
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chassis/VIN Number
          </label>
          <input
            type="text"
            value={formData.chassisNumber}
            onChange={(e) => handleInputChange('chassisNumber', e.target.value)}
            placeholder="17-character chassis number"
            maxLength={17}
            className={inputClasses}
          />
        </div>

        <button
          type="submit"
          disabled={isValidating}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isValidating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Validating...</span>
            </>
          ) : (
            <span>Validate Vehicle Data</span>
          )}
        </button>
      </form>

      {/* Camera modal */}
      {showScanner && (
        <PlateScanner
          onDetected={(plate) => {
            const normalized = normalizePlate(plate);
            handleInputChange('plateNumber', normalized);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
