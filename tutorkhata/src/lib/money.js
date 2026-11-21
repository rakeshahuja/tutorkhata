import { parseISODate } from './dates.js';

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const LOCALES = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };

export function formatINR(amount) {
  return INR.format(Number(amount) || 0);
}

export function formatDate(iso, lang) {
  if (!iso) return '';
  const locale = LOCALES[lang] ?? 'en-IN';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parseISODate(iso));
}
