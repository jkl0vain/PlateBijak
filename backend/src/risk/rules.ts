export type VehicleData = {
  plateNumber: string; make: string; model: string;
  year: string; engineCapacity: string; color: string; chassisNumber: string;
};
export type Finding = {
  field?: keyof VehicleData | 'behavior';
  type: 'success'|'info'|'warning'|'error';
  code: string;              // stable ID for each rule
  message: string;
  details?: string[];
  weight?: number;           // contribution to risk
  suggestion?: string;  
  confidence?: number;   
};

const commonMakes = new Set([
  'Toyota','Honda','Nissan','Mazda','Mitsubishi','Hyundai','Kia',
  'BMW','Mercedes-Benz','Audi','Volkswagen','Ford','Chevrolet',
  'Subaru','Lexus','Infiniti','Acura','Volvo','Jaguar','Land Rover'
]);

export function runRules(d: VehicleData, ctx: {ip?:string, attemptsFromIp?:number, recentFromFingerprint?:number}): Finding[] {
  const out: Finding[] = [];
  // Plate format
  if (d.plateNumber) {
    const clean = d.plateNumber.toUpperCase().replace(/\s/g,'');
    const regex = /^[A-Z]{1,3}\d{1,4}[A-Z]?$/;
    if (!regex.test(clean)) {
      out.push({ field:'plateNumber', type:'error', code:'PLATE_FORMAT',
        message:'Invalid plate number format', weight:15 });
    } else {
      if (/(.)\1{3,}/.test(clean) || /(0000|1111|2222|3333|4444|5555|6666|7777|8888|9999)/.test(clean)) {
        out.push({ field:'plateNumber', type:'warning', code:'PLATE_SUSPICIOUS',
          message:'Suspicious repeated/sequential pattern', weight:10 });
      }
    }
  }

  // Make sanity
if (d.make) {
  if (!commonMakes.has(d.make.trim())) {
    out.push({
      field: 'make',
      type: 'info',
      code: 'MAKE_UNCOMMON',
      message: 'Uncommon vehicle make',
      weight: 5
    })
  }
}

  // Utility: Levenshtein distance
  function levenshtein(a: string, b: string): number {
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : Math.min(
              dp[i - 1][j - 1] + 1,
              dp[i][j - 1] + 1,
              dp[i - 1][j] + 1
            );
      }
    }
    return dp[a.length][b.length];
  }

  function findClosest(input: string, options: string[]) {
    let best = { match: '', distance: Infinity };
    for (const opt of options) {
      const dist = levenshtein(input.toLowerCase(), opt.toLowerCase());
      if (dist < best.distance) best = { match: opt, distance: dist };
    }
    return best;
  }

  // Cross check maker with model
if (d.make && d.model) {
  const combos: Record<string, string[]> = {
    Toyota: ['Vios', 'Corolla', 'Camry', 'Hilux'],
    Honda: ['Civic', 'Accord', 'City', 'CR-V'],
    Nissan: ['Almera', 'X-Trail', 'Navara'],
    Mazda: ['CX-5', 'Mazda3', 'Mazda6'],
    Mitsubishi: ['ASX', 'Outlander', 'Triton'],
    Hyundai: ['Elantra', 'Tucson', 'Santa Fe'],
    Kia: ['Rio', 'Sportage', 'Sorento'],
    BMW: ['3 Series', '5 Series', 'X5'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC'],
    Audi: ['A3', 'A4', 'Q5'],
    Volkswagen: ['Golf', 'Passat', 'Tiguan'],
    Ford: ['Focus', 'Ranger', 'Everest'],
    Chevrolet: ['Cruze', 'Colorado', 'Captiva'],
    Subaru: ['Impreza', 'Forester', 'XV'],
    Lexus: ['IS', 'RX', 'NX'],
    Infiniti: ['Q50', 'QX60'],
    Acura: ['ILX', 'RDX', 'MDX'],
    Volvo: ['S60', 'XC60', 'XC90'],
    Jaguar: ['XE', 'XF', 'F-PACE'],
    'Land Rover': ['Range Rover', 'Discovery', 'Defender']
  }

  const make = d.make.trim()
  const validModels = combos[make] || []
  const model = d.model.trim()

  if (validModels.length && !validModels.includes(model)) {
    const { match, distance } = findClosest(model, validModels)

    if (distance <= 2) {
      out.push({
        field: 'model',
        type: 'warning',
        code: 'MODEL_TYPO',
        message: `Possible typo in model "${model}"`,
        suggestion: match,  
        details: [`Valid models for ${make}: ${validModels.join(', ')}`],
        weight: 10
      })
    } else {
      out.push({
        field: 'model',
        type: 'error',
        code: 'MODEL_MISMATCH',
        message: `Model "${model}" does not belong to make "${make}"`,
        details: [`Valid models for ${make}: ${validModels.join(', ')}`],
        weight: 20
      })
    }
  }
}

  // Year sanity
  if (d.year) {
    const year = Number(d.year);
    const now = new Date().getFullYear();
    if (Number.isNaN(year) || d.year.length !== 4) {
      out.push({ field:'year', type:'error', code:'YEAR_INVALID',
        message:'Year must be a 4-digit number', weight:15 });
    } else if (year < 1980 || year > now + 1) {
      out.push({ field:'year', type:'warning', code:'YEAR_OUT_OF_RANGE',
        message:`Unusual year ${year}`, weight:8 });
    }
  }

  // Engine capacity (liters)
  if (d.engineCapacity) {
    const cc = Number(d.engineCapacity);
    if (Number.isNaN(cc) || cc <= 0) {
      out.push({ field:'engineCapacity', type:'error', code:'CC_INVALID',
        message:'Engine capacity must be a positive number', weight:10 });
    } else if (cc < 0.5 || cc > 8) {
      out.push({ field:'engineCapacity', type:'warning', code:'CC_EXTREME',
        message:'Very unusual engine capacity', weight:6 });
    }
  }

  // VIN (format + check digit)
  if (d.chassisNumber) {
    out.push(...vinFindings(d.chassisNumber));
  }

  // Behavior signals
  if ((ctx.attemptsFromIp ?? 0) > 1000) {
    out.push({ field:'behavior', type:'warning', code:'IP_BURST',
      message:'High submission volume from this IP', weight:12 });
  }

  //tak perlu lagi buat fingerprint untuk demo, menyusahkan
  //const enableFingerprint = false;
  //if ((ctx.recentFromFingerprint ?? 0) > 5) {
  //  out.push({ field:'behavior', type:'warning', code:'DEVICE_BURST',
  //    message:'Many attempts from this device', weight:10 });
  //}

  // Color sanity + auto-correction
  /*if (d.color) {
    const commonColors = [
      'White', 'Black', 'Silver', 'Gray', 'Blue',
      'Red', 'Green', 'Yellow', 'Brown', 'Gold'
    ];

    const color = d.color.trim();
    if (!commonColors.includes(color)) {
      const { match, distance } = findClosest(color, commonColors);

      if (distance <= 2) {
        out.push({
          field: 'color',
          type: 'warning',
          code: 'COLOR_TYPO',
          message: `Possible typo in color "${color}"`,
          details: [`Closest known color: ${match}`],
          weight: 6
        });
      } else {
        out.push({
          field: 'color',
          type: 'info',
          code: 'COLOR_UNCOMMON',
          message: `Uncommon color "${color}" entered`,
          details: [`Typical colors: ${commonColors.join(', ')}`],
          weight: 3
        });
      }
    }
  }*/

  return out;
}

// -- VIN helpers
import { normalizeVIN, isValidVINFormat, verifyVINCheckDigit } from './vin.js';
function vinFindings(vinRaw: string): Finding[] {
  const vin = normalizeVIN(vinRaw);
  const f: Finding[] = [];
  if (vin.length !== 17) {
    f.push({ field:'chassisNumber', type:'error', code:'VIN_LEN',
      message:'VIN must be exactly 17 characters', weight:15 });
    return f;
  }
  if (!isValidVINFormat(vin)) {
    f.push({ field:'chassisNumber', type:'error', code:'VIN_CHARS',
      message:'VIN contains invalid characters (I,O,Q not allowed)', weight:15 });
    return f;
  }
  const chk = verifyVINCheckDigit(vin);
  if (!chk.ok) {
    f.push({ field:'chassisNumber', type:'warning', code:'VIN_CHECK',
      message:`VIN check digit mismatch`, details:[`Expected ${chk.expected}, got ${chk.actual}`], weight:12 });
  } else {
    f.push({ field:'chassisNumber', type:'success', code:'VIN_OK',
      message:'VIN format & check digit OK' });
  }
  return f;
}
