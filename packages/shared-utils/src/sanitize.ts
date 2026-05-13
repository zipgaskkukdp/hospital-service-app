const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_PATTERN = /(?:\+?\d{1,3}[-.\s]?)?(?:\d{2,3}[-.\s]?\d{3,4}[-.\s]?\d{4})/g;
const ADDRESS_HINT_PATTERN = /\b(?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)[^\n,.;]{0,40}/g;

export function removeDirectIdentifiers(input: string): string {
  return input
    .replace(EMAIL_PATTERN, "[email]")
    .replace(PHONE_PATTERN, "[phone]")
    .replace(ADDRESS_HINT_PATTERN, "[address]")
    .trim();
}

export function summarizeSymptomText(input: string, maxLength = 160): string {
  const sanitized = removeDirectIdentifiers(input).replace(/\s+/g, " ");
  if (sanitized.length <= maxLength) {
    return sanitized;
  }
  return `${sanitized.slice(0, maxLength - 3)}...`;
}

export function extractSymptomKeywords(input: string, maxKeywords = 8): string[] {
  const sanitized = removeDirectIdentifiers(input);
  const tokens = sanitized
    .split(/[\s,./;|!?()\[\]{}"'`~]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !token.startsWith("["));
  return Array.from(new Set(tokens)).slice(0, maxKeywords);
}
