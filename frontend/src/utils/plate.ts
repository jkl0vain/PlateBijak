export function normalizePlate(input: string) {
  if (!input) return "";
  // Uppercase, drop non-alphanumerics
  let s = input.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Common OCR fixes: O↔0, I↔1 when surrounded by digits
  s = s
    .replace(/(?<=\d)O(?=\d)/g, "0")
    .replace(/(?<=\d)I(?=\d)/g, "1")
    .replace(/^O(?=\d)/, "0")
    .replace(/^I(?=\d)/, "1");

  return s;
}

// Approx Malaysian plate rule (tune if needed)
export const PLATE_REGEX = /^[A-Z]{1,3}\d{1,4}[A-Z]?$/;

export function isValidPlate(plate: string) {
  return PLATE_REGEX.test(plate);
}
