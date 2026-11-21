import { formatINR, formatDate } from './money.js';

export function buildReminder(t, lang, { customerName, amount, dueDate, days }) {
  return t('reminder.message', {
    name: customerName,
    amount: formatINR(amount).replace('₹', '').trim(),
    dueDate: formatDate(dueDate, lang),
    days,
  });
}
