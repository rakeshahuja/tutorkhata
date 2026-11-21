import { toISODate, addDays } from './dates.js';
import { deriveStatus } from './status.js';

export const STORAGE_KEY = 'tutorkhata.v1';

export const SAMPLE_NAMES = {
  'Aarav Sharma': { nameHi: 'आरव शर्मा', nameMr: 'आरव शर्मा' },
  'Diya Patil': { nameHi: 'दिया पाटिल', nameMr: 'दिया पाटील' },
  'Kabir Mehta': { nameHi: 'कबीर मेहता', nameMr: 'कबीर मेहता' },
  'Ananya Joshi': { nameHi: 'अनन्या जोशी', nameMr: 'अनन्या जोशी' },
  'Rohan Deshmukh': { nameHi: 'रोहन देशमुख', nameMr: 'रोहन देशमुख' },
  'Sneha Kulkarni': { nameHi: 'स्नेहा कुलकर्णी', nameMr: 'स्नेहा कुलकर्णी' },
  'Vihaan Iyer': { nameHi: 'विहान अय्यर', nameMr: 'विहान अय्यर' },
  'Meera Nair': { nameHi: 'मीरा नायर', nameMr: 'मीरा नायर' },
  'Arjun Pawar': { nameHi: 'अर्जुन पवार', nameMr: 'अर्जुन पवार' },
  Rent: { nameHi: 'किराया', nameMr: 'भाडे' },
  Internet: { nameHi: 'इंटरनेट', nameMr: 'इंटरनेट' },
  Electricity: { nameHi: 'बिजली', nameMr: 'वीज' },
};

export function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function buildSeed(today = new Date()) {
  const todayIso = toISODate(today);

  const customers = [
    { name: 'Aarav Sharma', monthlyFee: 2000 },
    { name: 'Diya Patil', monthlyFee: 1500 },
    { name: 'Kabir Mehta', monthlyFee: 2500 },
    { name: 'Ananya Joshi', monthlyFee: 3000 },
    { name: 'Rohan Deshmukh', monthlyFee: 1800 },
    { name: 'Sneha Kulkarni', monthlyFee: 2200 },
    { name: 'Vihaan Iyer', monthlyFee: 1500 },
    { name: 'Meera Nair', monthlyFee: 2800 },
    { name: 'Arjun Pawar', monthlyFee: 2000 },
  ].map((c) => ({ id: makeId(), ...c, ...SAMPLE_NAMES[c.name] }));

  const byName = Object.fromEntries(customers.map((c) => [c.name, c]));

  const makeInvoice = (name, dueOffset, paid = false) => {
    const customer = byName[name];
    const dueDate = addDays(todayIso, dueOffset);
    const inv = {
      id: makeId(),
      customerId: customer.id,
      amount: customer.monthlyFee,
      issueDate: addDays(dueDate, -30),
      dueDate,
      paidDate: paid ? addDays(dueDate, 3) : null,
    };
    return { ...inv, status: deriveStatus(inv, todayIso) };
  };

  const invoices = [
    // Overdue, unpaid
    makeInvoice('Aarav Sharma', -5),
    makeInvoice('Kabir Mehta', -12),
    makeInvoice('Rohan Deshmukh', -20),
    makeInvoice('Meera Nair', -33),
    // Pending, unpaid
    makeInvoice('Diya Patil', 3),
    makeInvoice('Ananya Joshi', 10),
    makeInvoice('Sneha Kulkarni', 18),
    // Paid
    makeInvoice('Vihaan Iyer', -40, true),
    makeInvoice('Arjun Pawar', -25, true),
    makeInvoice('Diya Patil', -15, true),
    makeInvoice('Ananya Joshi', -8, true),
  ];

  const bills = [
    { name: 'Rent', amount: 12000, dueOffset: 5 },
    { name: 'Internet', amount: 899, dueOffset: 12 },
    { name: 'Electricity', amount: 1450, dueOffset: 19 },
  ].map(({ name, amount, dueOffset }) => ({
    id: makeId(),
    name,
    amount,
    dueDate: addDays(todayIso, dueOffset),
    ...SAMPLE_NAMES[name],
  }));

  return { customers, invoices, bills };
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable; data stays in memory for this session.
  }
}

// Fills nameHi/nameMr for known sample names that lack them. Never overwrites
// existing values. Returns true if anything changed.
function backfillSampleNames(items) {
  let changed = false;
  for (const item of items) {
    if (
      item &&
      typeof item === 'object' &&
      typeof item.name === 'string' &&
      Object.hasOwn(SAMPLE_NAMES, item.name) &&
      (!item.nameHi || !item.nameMr)
    ) {
      const names = SAMPLE_NAMES[item.name];
      if (!item.nameHi) item.nameHi = names.nameHi;
      if (!item.nameMr) item.nameMr = names.nameMr;
      changed = true;
    }
  }
  return changed;
}

export function loadData(today = new Date()) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (
        data &&
        typeof data === 'object' &&
        Array.isArray(data.customers) &&
        Array.isArray(data.invoices) &&
        Array.isArray(data.bills)
      ) {
        const changedCustomers = backfillSampleNames(data.customers);
        const changedBills = backfillSampleNames(data.bills);
        if (changedCustomers || changedBills) saveData(data);
        return data;
      }
    }
  } catch {
    // Unreadable or corrupt storage; fall back to seed data below.
  }
  const seed = buildSeed(today);
  saveData(seed);
  return seed;
}
