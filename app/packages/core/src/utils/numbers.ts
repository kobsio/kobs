/**
 * `roundNumber` rounds the provided `value` to the number of decimal places (`dec`).
 */
export const roundNumber = (value: number, dec = 2): number => {
  return Math.round(value * Math.pow(10, dec)) / Math.pow(10, dec);
};
