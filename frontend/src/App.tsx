import React, { useState } from 'react'
import { Header } from './components/Header'
import { VehicleForm } from './components/VehicleForm'
import { ValidationResults } from './components/ValidationResults'
import { Dashboard } from './components/Dashboard'
import { VehicleData, ValidationResult } from './types/vehicle'

function App() {
  const [currentView, setCurrentView] = useState<'form' | 'dashboard'>('form')
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    plateNumber: '',
    make: '',
    model: '',
    year: '',
    engineCapacity: '',
    color: '',
    chassisNumber: ''
  })
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [isValidating, setIsValidating] = useState(false)
  //newly added - fraud detection
  const [riskScore, setRiskScore] = useState<number | null>(null)
  const [action, setAction] = useState<'allow' | 'review' | 'block' | null>(null)

  const handleValidation = async (data: VehicleData) => {
    setIsValidating(true)
    setVehicleData(data)

    // ada fingerprint (currently based on browser)
    const fp = localStorage.getItem('svv_fp') || cryptoRandom();
    localStorage.setItem('svv_fp', fp);

    try {
      const resp = await fetch('http://localhost:4000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, fingerprint: fp })
      })
      const json = await resp.json()
      setValidationResults(json.results)
      //fraud detection
      setRiskScore(json.riskScore)
      setAction(json.action)

    } catch (e) {
      setValidationResults([{
        field: 'behavior',
        type: 'error',
        message: 'Server error during validation',
        reason: (e as Error).message
      } as any])
    } finally {
      setIsValidating(false)
    }
  }

  function cryptoRandom() {
    return (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2)
  }

  //semua ni dah edit dekat backend, TAPI JANGAN DELETE LAGI
  /*const validateVehicleData = (data: VehicleData): ValidationResult[] => {
    const results: ValidationResult[] = []
    
    // Plate number validation with detailed reasons
    if (data.plateNumber) {
      const platePattern = /^[A-Z]{1,3}\s?\d{1,4}\s?[A-Z]?$/
      const cleanPlate = data.plateNumber.toUpperCase().replace(/\s/g, '')
      
      if (!platePattern.test(data.plateNumber.toUpperCase())) {
        const issues: string[] = []
        
        // Check for common issues
        if (!/^[A-Z]/.test(cleanPlate)) {
          issues.push('Must start with letters')
        }
        if (!/\d/.test(cleanPlate)) {
          issues.push('Must contain numbers')
        }
        if (cleanPlate.length < 4) {
          issues.push('Too short (minimum 4 characters)')
        }
        if (cleanPlate.length > 8) {
          issues.push('Too long (maximum 8 characters)')
        }
        if (/[^A-Z0-9\s]/.test(data.plateNumber)) {
          issues.push('Contains invalid characters (only letters, numbers, and spaces allowed)')
        }
        
        results.push({
          field: 'plateNumber',
          type: 'error',
          message: 'Invalid plate number format detected',
          reason: 'The plate number does not match standard formatting requirements',
          details: issues,
          suggestion: 'Use format like "ABC 1234" or "WXY 123A". Common formats: 3 letters + 4 numbers, or 2 letters + 4 numbers + 1 letter',
          confidence: 0.95
        })
      } else {
        // Check for suspicious patterns
        const suspiciousPatterns = [
          { pattern: /^(.)\1{2,}/, message: 'Repeated characters detected' },
          { pattern: /0000|1111|2222|3333|4444|5555|6666|7777|8888|9999/, message: 'Sequential or repeated numbers' }
        ]
        
        const suspiciousIssue = suspiciousPatterns.find(p => p.pattern.test(cleanPlate))
        
        if (suspiciousIssue) {
          results.push({
            field: 'plateNumber',
            type: 'warning',
            message: 'Unusual plate number pattern detected',
            reason: suspiciousIssue.message,
            details: ['This pattern is uncommon for vehicle plates', 'Please verify the plate number is correct'],
            suggestion: 'Double-check the plate number for accuracy',
            confidence: 0.75
          })
        } else {
          results.push({
            field: 'plateNumber',
            type: 'success',
            message: 'Plate number format is valid',
            reason: 'Matches standard plate number formatting requirements',
            confidence: 0.98
          })
        }
      }
    }

    // Enhanced make validation with detailed typo analysis
    if (data.make) {
      const commonMakes = [
        'Toyota', 'Honda', 'Nissan', 'Mazda', 'Mitsubishi', 'Hyundai', 'Kia', 
        'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford', 'Chevrolet', 
        'Subaru', 'Lexus', 'Infiniti', 'Acura', 'Volvo', 'Jaguar', 'Land Rover'
      ]
      
      const closestMatch = findClosestMatch(data.make, commonMakes)
      const exactMatch = commonMakes.find(make => make.toLowerCase() === data.make.toLowerCase())
      
      if (exactMatch && exactMatch !== data.make) {
        // Case mismatch
        results.push({
          field: 'make',
          type: 'warning',
          message: 'Case formatting issue detected',
          reason: 'Vehicle make has incorrect capitalization',
          details: [`Expected: "${exactMatch}"`, `Found: "${data.make}"`],
          suggestion: `Auto-correct to "${exactMatch}"`,
          confidence: 0.95
        })
      } else if (closestMatch.distance > 0 && closestMatch.distance <= 2) {
        // Typo detected
        const typoReasons: string[] = []
        if (Math.abs(data.make.length - closestMatch.match.length) > 0) {
          typoReasons.push('Length mismatch detected')
        }
        if (closestMatch.distance === 1) {
          typoReasons.push('Single character difference (likely typo)')
        } else {
          typoReasons.push('Multiple character differences detected')
        }
        
        results.push({
          field: 'make',
          type: 'warning',
          message: `Possible typo in vehicle make`,
          reason: 'Input does not match known vehicle manufacturers exactly',
          details: typoReasons.concat([
            `Similarity: ${Math.round((1 - closestMatch.distance / Math.max(data.make.length, closestMatch.match.length)) * 100)}%`,
            `Closest match: "${closestMatch.match}"`
          ]),
          suggestion: `Did you mean "${closestMatch.match}"?`,
          confidence: 0.85
        })
      } else if (commonMakes.includes(data.make)) {
        results.push({
          field: 'make',
          type: 'success',
          message: 'Vehicle make verified',
          reason: 'Matches known vehicle manufacturer database',
          confidence: 0.99
        })
      } else if (closestMatch.distance > 2) {
        results.push({
          field: 'make',
          type: 'info',
          message: 'Uncommon vehicle make detected',
          reason: 'Vehicle make not found in common manufacturers database',
          details: [
            'This could be a rare, luxury, or regional brand',
            'Manual verification may be required',
            `Closest known make: "${closestMatch.match}"`
          ],
          suggestion: 'Verify spelling or check if this is a valid manufacturer',
          confidence: 0.60
        })
      }
    }

    // Enhanced year validation with detailed analysis
    if (data.year) {
      const currentYear = new Date().getFullYear()
      const year = parseInt(data.year)
      
      if (isNaN(year)) {
        results.push({
          field: 'year',
          type: 'error',
          message: 'Invalid year format',
          reason: 'Year must be a valid number',
          details: [`Input received: "${data.year}"`, 'Expected: 4-digit year (e.g., 2020)'],
          suggestion: 'Enter a valid 4-digit year',
          confidence: 0.99
        })
      } else if (year < 1900) {
        results.push({
          field: 'year',
          type: 'error',
          message: 'Year too old for modern vehicles',
          reason: 'Vehicles manufactured before 1900 are extremely rare',
          details: [
            `Year entered: ${year}`,
            'Modern vehicle registration typically starts from 1900',
            'This may be a data entry error'
          ],
          suggestion: 'Check if you meant a year in the 1900s or 2000s',
          confidence: 0.99
        })
      } else if (year > currentYear + 1) {
        results.push({
          field: 'year',
          type: 'error',
          message: 'Future year detected',
          reason: 'Vehicle cannot be manufactured in the future',
          details: [
            `Year entered: ${year}`,
            `Current year: ${currentYear}`,
            'Maximum allowed: Next year for pre-orders'
          ],
          suggestion: `Enter a year between 1900 and ${currentYear + 1}`,
          confidence: 0.99
        })
      } else if (year > currentYear - 30) {
        const age = currentYear - year
        results.push({
          field: 'year',
          type: 'success',
          message: 'Year of manufacture verified',
          reason: `Vehicle is ${age} year${age !== 1 ? 's' : ''} old - within normal range`,
          confidence: 0.95
        })
      } else {
        const age = currentYear - year
        results.push({
          field: 'year',
          type: 'info',
          message: 'Older vehicle detected',
          reason: `Vehicle is ${age} years old - considered vintage/classic`,
          details: [
            'May require additional documentation',
            'Insurance rates may differ for older vehicles',
            'Verify all other details carefully'
          ],
          suggestion: 'Ensure all vehicle details are accurate for older vehicles',
          confidence: 0.90
        })
      }
    }

    // Enhanced engine capacity validation
    if (data.engineCapacity) {
      const capacity = parseFloat(data.engineCapacity)
      
      if (isNaN(capacity)) {
        results.push({
          field: 'engineCapacity',
          type: 'error',
          message: 'Invalid engine capacity format',
          reason: 'Engine capacity must be a valid number',
          details: [`Input received: "${data.engineCapacity}"`, 'Expected: Decimal number (e.g., 2.0, 1.5)'],
          suggestion: 'Enter engine capacity in liters (e.g., 2.0 for 2.0L engine)',
          confidence: 0.95
        })
      } else if (capacity <= 0) {
        results.push({
          field: 'engineCapacity',
          type: 'error',
          message: 'Invalid engine capacity value',
          reason: 'Engine capacity must be greater than zero',
          details: [`Value entered: ${capacity}L`, 'Minimum realistic value: 0.1L'],
          suggestion: 'Enter a positive value for engine capacity',
          confidence: 0.99
        })
      } else if (capacity < 0.5) {
        results.push({
          field: 'engineCapacity',
          type: 'warning',
          message: 'Very small engine capacity',
          reason: 'Engine capacity below 0.5L is uncommon for standard vehicles',
          details: [
            `Capacity: ${capacity}L`,
            'Typical range: 1.0L - 6.0L for most vehicles',
            'May be valid for motorcycles or micro cars'
          ],
          suggestion: 'Verify this is correct - consider if unit is in liters',
          confidence: 0.70
        })
      } else if (capacity > 8.0) {
        results.push({
          field: 'engineCapacity',
          type: 'warning',
          message: 'Very large engine capacity',
          reason: 'Engine capacity above 8.0L is uncommon for standard vehicles',
          details: [
            `Capacity: ${capacity}L`,
            'Typical range: 1.0L - 6.0L for most vehicles',
            'May be valid for trucks, sports cars, or specialty vehicles'
          ],
          suggestion: 'Verify this is correct for your vehicle type',
          confidence: 0.75
        })
      } else {
        let category = ''
        if (capacity <= 1.2) category = 'Small/Economy'
        else if (capacity <= 2.0) category = 'Compact/Mid-size'
        else if (capacity <= 3.5) category = 'Large/Performance'
        else category = 'Heavy-duty/Performance'
        
        results.push({
          field: 'engineCapacity',
          type: 'success',
          message: 'Engine capacity within normal range',
          reason: `${capacity}L engine falls within typical ${category.toLowerCase()} vehicle range`,
          details: [`Category: ${category}`, 'Within standard automotive specifications'],
          confidence: 0.92
        })
      }
    }

    // Enhanced chassis number validation
    if (data.chassisNumber) {
      const vin = data.chassisNumber.toUpperCase().replace(/\s/g, '')
      const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/
      
      if (vin.length !== 17) {
        results.push({
          field: 'chassisNumber',
          type: 'error',
          message: 'Incorrect chassis number length',
          reason: 'Standard VIN/Chassis numbers must be exactly 17 characters',
          details: [
            `Current length: ${vin.length} characters`,
            'Required length: 17 characters',
            vin.length < 17 ? 'Missing characters detected' : 'Extra characters detected'
          ],
          suggestion: 'Verify the complete 17-character VIN from vehicle documents',
          confidence: 0.99
        })
      } else if (!vinPattern.test(vin)) {
        const invalidChars = vin.split('').filter(char => !/[A-HJ-NPR-Z0-9]/.test(char))
        results.push({
          field: 'chassisNumber',
          type: 'error',
          message: 'Invalid characters in chassis number',
          reason: 'VIN contains prohibited characters (I, O, Q are not allowed)',
          details: [
            `Invalid characters found: ${[...new Set(invalidChars)].join(', ')}`,
            'Allowed: A-H, J-N, P-R, T-Z, 0-9',
            'Prohibited: I, O, Q (to avoid confusion with 1, 0)'
          ],
          suggestion: 'Check for misread characters - I/1, O/0, Q/G are commonly confused',
          confidence: 0.97
        })
      } else {
        // Additional VIN validation checks
        const warnings: string[] = []
        
        // Check for suspicious patterns
        if (/(.)\1{4,}/.test(vin)) {
          warnings.push('Contains 5+ repeated characters')
        }
        if (!/\d/.test(vin)) {
          warnings.push('No numbers found (unusual for VIN)')
        }
        if (!/[A-HJ-NPR-Z]/.test(vin)) {
          warnings.push('No letters found (unusual for VIN)')
        }
        
        if (warnings.length > 0) {
          results.push({
            field: 'chassisNumber',
            type: 'warning',
            message: 'Unusual VIN pattern detected',
            reason: 'VIN format is valid but contains unusual patterns',
            details: warnings.concat(['This may indicate data entry errors', 'VIN appears structurally correct']),
            suggestion: 'Double-check VIN against vehicle documents',
            confidence: 0.80
          })
        } else {
          results.push({
            field: 'chassisNumber',
            type: 'success',
            message: 'Chassis number format verified',
            reason: 'VIN meets all standard formatting requirements',
            details: ['17 characters confirmed', 'No prohibited characters', 'Standard pattern validated'],
            confidence: 0.95
          })
        }
      }
    }

    // Color validation (new)
    if (data.color) {
      const commonColors = [
        'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow',
        'Brown', 'Orange', 'Purple', 'Gold', 'Beige', 'Maroon', 'Navy'
      ]
      
      const colorMatch = findClosestMatch(data.color, commonColors)
      
      if (colorMatch.distance === 0 || commonColors.some(c => c.toLowerCase() === data.color.toLowerCase())) {
        results.push({
          field: 'color',
          type: 'success',
          message: 'Vehicle color verified',
          reason: 'Color matches common vehicle color database',
          confidence: 0.90
        })
      } else if (colorMatch.distance <= 2) {
        results.push({
          field: 'color',
          type: 'warning',
          message: 'Possible color name typo',
          reason: 'Color name is similar to common vehicle colors',
          details: [`Closest match: "${colorMatch.match}"`, `Similarity: ${Math.round((1 - colorMatch.distance / Math.max(data.color.length, colorMatch.match.length)) * 100)}%`],
          suggestion: `Did you mean "${colorMatch.match}"?`,
          confidence: 0.75
        })
      } else {
        results.push({
          field: 'color',
          type: 'info',
          message: 'Uncommon color name detected',
          reason: 'Color name not found in standard vehicle color database',
          details: [
            'May be a custom, metallic, or manufacturer-specific color',
            'Consider using more common color names for consistency'
          ],
          suggestion: 'Verify color name or use closest standard color',
          confidence: 0.65
        })
      }
    }

    // Model validation (new)
    if (data.model && data.make) {
      const modelLength = data.model.length
      if (modelLength < 2) {
        results.push({
          field: 'model',
          type: 'warning',
          message: 'Very short model name',
          reason: 'Vehicle model names are typically longer than 1 character',
          details: [`Model length: ${modelLength} character${modelLength !== 1 ? 's' : ''}`, 'Typical range: 2-20 characters'],
          suggestion: 'Verify the complete model name',
          confidence: 0.80
        })
      } else if (modelLength > 30) {
        results.push({
          field: 'model',
          type: 'warning',
          message: 'Very long model name',
          reason: 'Vehicle model names are typically shorter than 30 characters',
          details: [`Model length: ${modelLength} characters`, 'May include unnecessary details'],
          suggestion: 'Use the primary model name without trim/package details',
          confidence: 0.75
        })
      } else {
        results.push({
          field: 'model',
          type: 'success',
          message: 'Model name format acceptable',
          reason: 'Model name length is within typical range',
          confidence: 0.85
        })
      }
    }

    return results
  }*/

  /*const findClosestMatch = (input: string, options: string[]) => {
    let minDistance = Infinity
    let closestMatch = ''
    
    options.forEach(option => {
      const distance = levenshteinDistance(input.toLowerCase(), option.toLowerCase())
      if (distance < minDistance) {
        minDistance = distance
        closestMatch = option
      }
    })
    
    return { match: closestMatch, distance: minDistance }
  }*/

  /*const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }*/

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="container mx-auto px-4 py-8">
        {currentView === 'form' ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Smart Vehicle Data Validation
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Ensure accurate vehicle information for faster insurance processing with our AI-powered validation system
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <VehicleForm 
                onValidate={handleValidation}
                isValidating={isValidating}
                initialData={vehicleData}
              />
              
              <ValidationResults 
                results={validationResults}
                isValidating={isValidating}
                vehicleData={vehicleData}
                //tambah baru untuk fraud detection
                riskScore={riskScore}
                action={action}
              />
            </div>
          </div>
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  )
}

export default App
