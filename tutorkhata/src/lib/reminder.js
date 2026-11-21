import { formatCurrency, formatDate } from './money.js';

// Builds the WhatsApp-style reminder in the selected language.
// The template (reminder.message_one / reminder.message_other) takes name, amount, dueDate and count;
// count (days overdue) is pluralised and formatted with the app's digits by t().
export function buildReminder(t, lang, { customerName, amount, dueDate, days }) {
  return t('reminder.message', {
    count: days,
    name: customerName,
    amount: formatCurrency(amount, lang),
    dueDate: formatDate(dueDate, t, lang),
  });
}
