import { daysBetween } from './dates.js';

export function deriveStatus(invoice, todayISO) {
  if (invoice.paidDate) return 'Paid';
  if (invoice.dueDate < todayISO) return 'Overdue';
  return 'Pending';
}

export function daysOverdue(invoice, todayISO) {
  return deriveStatus(invoice, todayISO) === 'Overdue'
    ? Math.max(0, daysBetween(invoice.dueDate, todayISO))
    : 0;
}

export function normalizeInvoices(invoices, todayISO) {
  return invoices.map((inv) => ({ ...inv, status: deriveStatus(inv, todayISO) }));
}
