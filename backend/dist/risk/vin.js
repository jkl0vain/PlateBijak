"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeVIN = normalizeVIN;
exports.isValidVINFormat = isValidVINFormat;
exports.verifyVINCheckDigit = verifyVINCheckDigit;
// ISO 3779 VIN check digit
const translit = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
    S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
};
const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
function normalizeVIN(vin) {
    return vin.toUpperCase().replace(/\s/g, '');
}
function isValidVINFormat(vin) {
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}
function verifyVINCheckDigit(vinRaw) {
    const vin = normalizeVIN(vinRaw);
    if (vin.length !== 17 || !isValidVINFormat(vin))
        return { ok: false, reason: "format" };
    let sum = 0;
    for (let i = 0; i < 17; i++) {
        const c = vin[i];
        const v = translit[c];
        if (v === undefined)
            return { ok: false, reason: "char" };
        sum += v * weights[i];
    }
    const remainder = sum % 11;
    const expected = remainder === 10 ? 'X' : String(remainder);
    const actual = vin[8];
    return { ok: expected === actual, expected, actual };
}
