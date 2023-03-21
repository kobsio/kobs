export const description =
  'The leading hybrid and multi-cloud platform that provides next-gen WAF, API Security, RASP, Advanced Rate Limiting, Bot Protection, and DDoS purpose built to eliminate the challenges of legacy WAF.';

export const getFlag = (countryCode?: string): string => {
  if (!countryCode) return '';

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
