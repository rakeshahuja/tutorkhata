import { addDays } from './dates.js';
import { deriveStatus } from './status.js';

export const DEFAULT_OPENING = 25000;
const OPENING_KEY = 'tutorkhata.forecast.opening';

export function getOpeningBalance() {
  try {
    const raw = localStorage.getItem(OPENING_KEY);
    if (raw === null) return DEFAULT_OPENING;
    const n = Number(raw);
    if (!Number.isFinite(n)) return DEFAULT_OPENING;
    return n;
  } catch {
    return DEFAULT_OPENING;
  }
}

export function saveOpeningBalance(value) {
  try {
    localStorage.setItem(OPENING_KEY, String(value));
  } catch {
    /* storage blocked: keep going */
  }
}

export function buildForecast({ invoices, bills, customers, today, days, opening, delay }) {
  const end = addDays(today, days - 1);
  const inRange = (iso) => iso >= today && iso <= end;

  const buckets = [];
  const byDate = new Map();
  for (let i = 0; i < days; i++) {
    const date = addDays(today, i);
    const bucket = { date, cashIn: 0, cashOut: 0 };
    buckets.push(bucket);
    byDate.set(date, bucket);
  }

  const items = [];

  for (const inv of invoices) {
    const status = deriveStatus(inv, today);
    if (status !== 'Pending' && status !== 'Overdue') continue;
    const base = status === 'Overdue' ? today : inv.dueDate;
    const delayed = !!delay && inv.customerId === delay.customerId;
    const date = delayed ? addDays(base, delay.days) : base;
    if (!inRange(date)) continue;
    const bucket = byDate.get(date);
    if (!bucket) continue;
    const amount = Number(inv.amount);
    bucket.cashIn += amount;
    const entity = customers.find((c) => c.id === inv.customerId) || { name: '' };
    items.push({ kind: 'in', date, amount, entity, overdue: status === 'Overdue', delayed });
  }

  for (const bill of bills) {
    if (!inRange(bill.dueDate)) continue;
    const bucket = byDate.get(bill.dueDate);
    if (!bucket) continue;
    const amount = Number(bill.amount);
    bucket.cashOut += amount;
    items.push({ kind: 'out', date: bill.dueDate, amount, entity: bill, overdue: false, delayed: false });
  }

  let bal = Number(opening) || 0;
  const dayRows = buckets.map((b) => {
    bal = bal + b.cashIn - b.cashOut;
    return { date: b.date, cashIn: b.cashIn, cashOut: b.cashOut, balance: bal };
  });

  const totalIn = dayRows.reduce((sum, r) => sum + r.cashIn, 0);
  const totalOut = dayRows.reduce((sum, r) => sum + r.cashOut, 0);
  const endBalance = dayRows.length ? dayRows[dayRows.length - 1].balance : bal;

  let lowest = null;
  for (const r of dayRows) {
    if (!lowest || r.balance < lowest.balance) lowest = { balance: r.balance, date: r.date };
  }

  const negative = dayRows.find((r) => r.balance < 0);
  const firstNegative = negative ? negative.date : null;

  items.sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    if (a.kind === b.kind) return 0;
    return a.kind === 'in' ? -1 : 1;
  });

  return { days: dayRows, totalIn, totalOut, endBalance, lowest, firstNegative, items };
}

export function suggestAction(result) {
  if (result.firstNegative === null) return null;
  const overdueIns = result.items.filter((i) => i.kind === 'in' && i.overdue);
  if (overdueIns.length) {
    const item = overdueIns.reduce((best, i) => (i.amount > best.amount ? i : best));
    return { kind: 'chase', item };
  }
  return { kind: 'review' };
}
