import { useI18n } from '../lib/i18n.jsx';
import { todayISO } from '../lib/dates.js';
import { formatCurrency, formatDate } from '../lib/money.js';
import { deriveStatus, daysOverdue } from '../lib/status.js';
import { getDisplayName } from '../lib/names.js';

export default function OwesTable({ customers, invoices }) {
  const { t, lang } = useI18n();
  const today = todayISO();

  const unpaid = invoices
    .map(inv => ({ inv, status: deriveStatus(inv, today) }))
    .filter(x => x.status === 'Pending' || x.status === 'Overdue');

  const map = new Map();
  for (const { inv } of unpaid) {
    const id = inv.customerId;
    let row = map.get(id);
    if (!row) {
      row = { customerId: id, owed: 0, dueDate: inv.dueDate, days: 0 };
      map.set(id, row);
    }
    row.owed += Number(inv.amount);
    if (inv.dueDate < row.dueDate) row.dueDate = inv.dueDate;
    row.days = Math.max(row.days, daysOverdue(inv, today));
  }

  const rows = [...map.values()]
    .map(row => ({ ...row, customer: customers.find(c => c.id === row.customerId) }))
    .filter(row => row.customer !== undefined);
  rows.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  if (rows.length === 0) {
    return (
      <div className="card">
        <h2>{t('dashboard.whoOwes')}</h2>
        <p className="muted">{t('dashboard.noOwed')}</p>
      </div>
    );
  }

  return (
    <div className="card owes-card">
      <h2>{t('dashboard.whoOwes')}</h2>
      <table className="table">
        <thead>
          <tr>
            <th>{t('customers.col.name')}</th>
            <th>{t('dashboard.owed')}</th>
            <th>{t('invoices.col.due')}</th>
            <th>{t('invoices.col.status')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.customerId} className="stack-row">
              <td data-label={t('customers.col.name')}>{getDisplayName(row.customer, lang)}</td>
              <td data-label={t('dashboard.owed')}>{formatCurrency(row.owed, lang)}</td>
              <td data-label={t('invoices.col.due')}>{formatDate(row.dueDate, t, lang)}</td>
              <td data-label={t('invoices.col.status')}>
                <div className="owes-status">
                  {row.days > 0 ? (
                    <>
                      <span className="badge badge-overdue">{t('status.Overdue')}</span>
                      <div className="muted">{t('invoices.daysOverdue', { count: row.days })}</div>
                    </>
                  ) : (
                    <span className="badge badge-pending">{t('status.Pending')}</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
