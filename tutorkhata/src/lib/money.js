const LOCALES = { en: 'en-IN', hi: 'hi-IN-u-nu-deva', mr: 'mr-IN-u-nu-deva' };

function localeFor(lang) {
  return LOCALES[lang] ?? LOCALES.en;
}

// Numbers with grouping, in the app language's digits (Western for en, Devanagari for hi and mr).
export function formatNumber(value, lang = 'en') {
  return new Intl.NumberFormat(localeFor(lang)).format(Number(value) || 0);
}

// Rupee amount: en gives ₹1,50,000 ; hi and mr give ₹१,५०,०००.
export function formatCurrency(value, lang = 'en') {
  return new Intl.NumberFormat(localeFor(lang), {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

// Digits only, no grouping (used for the day and year in dates).
function plainDigits(value, lang) {
  return new Intl.NumberFormat(localeFor(lang), { useGrouping: false }).format(value);
}

// iso is yyyy-mm-dd. Output: "12 October 2026" (en), "१२ अक्टूबर २०२६" (hi), "१२ ऑक्टोबर २०२६" (mr).
// Month names come from the translation keys month.1 ... month.12 via the passed t function.
export function formatDate(iso, t, lang = 'en') {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${plainDigits(d, lang)} ${t('month.' + m)} ${plainDigits(y, lang)}`;
}

// Accepts Western (0-9) and Devanagari (०-९) digits, optional commas and spaces.
// Returns a plain JavaScript number, or NaN when the text is not a number.
export function parseAmount(input) {
  const western = String(input ?? '')
    .replace(/[\u0966-\u096F]/g, ch => String(ch.charCodeAt(0) - 0x0966))
    .replace(/[,\s]/g, '');
  return western === '' ? NaN : Number(western);
}
