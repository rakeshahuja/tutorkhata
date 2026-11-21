import { useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { todayISO, addDays } from '../lib/dates.js';
import { formatINR, formatDate } from '../lib/money.js';
import { daysOverdue } from '../lib/status.js';
import { buildReminder } from '../lib/reminder.js';

export default function Invoices({ customers, invoices, bills, onCreateInvoice, onMarkPaid }) {
  const { t, lang } = useI18n();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    customerId: '',
    amount: '',
    issueDate: todayISO(),
    dueDate: addDays(todayISO(), 7),
  });
  const [formError, setFormError] = useState('');
  const [reminderFor, setReminderFor] = useState(null);
  const [copied, setCopied] = useState(false);

  const customerName = id => customers.find(c => c.id === id)?.name ?? '';
  const today = todayISO();
  const sorted = [...invoices].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const upcoming = bills
    .filter(b => b.dueDate >= today && b.dueDate <= addDays(today, 30))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const message = reminderFor
    ? buildReminder(t, lang, {
        customerName: customerName(reminderFor.customerId),
        amount: reminderFor.amount,
        dueDate: reminderFor.dueDate,
        days: daysOverdue(reminderFor, today),
      })
    : '';

  function handleCreate(e) {
    e.preventDefault();
    if (!form.customerId) return setFormError('validation.customerRequired');
    if (!(Number(form.amount) > 0)) return setFormError('validation.amountInvalid');
    if (!form.issueDate || !form.dueDate) return setFormError('validation.dateRequired');
    if (form.dueDate < form.issueDate) return setFormError('validation.dueBeforeIssue');

    onCreateInvoice({
      customerId: form.customerId,
      amount: Number(form.amount),
      issueDate: form.issueDate,
      dueDate: form.dueDate,
    });
    setForm({ customerId: '', amount: '', issueDate: todayISO(), dueDate: addDays(todayISO(), 7) });
    setFormError('');
    setShowCreate(false);
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      // Fallback for browsers without the async clipboard API
      try {
        const el = document.createElement('textarea');
        el.value = message;
        document.body.appendChild(el);
        el.select();
        const ok = document.execCommand('copy');
        el.remove();
        setCopied(ok);
      } catch {
        setCopied(false);
      }
    }
  }

  return (
    <section className="page">
      <div className="page-head">
        <button type="button" className="btn btn-primary" onClick={() => setShowCreate(s => !s)}>
          {t('invoices.create')}
        </button>
      </div>

      {showCreate && (
        <div className="card">
          <h2>{t('invoices.createTitle')}</h2>
          <form className="form-grid" noValidate onSubmit={handleCreate}>
            <div className="field">
              <label htmlFor="inv-customer">{t('invoices.customer')}</label>
              <select
                id="inv-customer"
                value={form.customerId}
                onChange={e => {
                  const id = e.target.value;
                  const c = customers.find(x => x.id === id);
                  setForm({ ...form, customerId: id, amount: c ? String(c.monthlyFee) : form.amount });
                }}
              >
                <option value="">{t('invoices.selectCustomer')}</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="inv-amount">{t('invoices.amount')}</label>
              <input
                id="inv-amount"
                type="number"
                inputMode="numeric"
                min="1"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="inv-issue">{t('invoices.issueDate')}</label>
              <input
                id="inv-issue"
                type="date"
                value={form.issueDate}
                onChange={e => setForm({ ...form, issueDate: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="inv-due">{t('invoices.dueDate')}</label>
              <input
                id="inv-due"
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            {formError && <p className="error" role="alert">{t(formError)}</p>}
            <button type="submit" className="btn btn-primary">{t('invoices.create')}</button>
          </form>
        </div>
      )}

      <div className="card">
        {invoices.length === 0 ? (
          <p className="muted">{t('invoices.empty')}</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t('invoices.col.customer')}</th>
                <th>{t('invoices.col.amount')}</th>
                <th>{t('invoices.col.issue')}</th>
                <th>{t('invoices.col.due')}</th>
                <th>{t('invoices.col.status')}</th>
                <th>{t('invoices.col.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(inv => (
                <tr key={inv.id} className="stack-row">
                  <td data-label={t('invoices.col.customer')}>{customerName(inv.customerId)}</td>
                  <td data-label={t('invoices.col.amount')}>{formatINR(inv.amount)}</td>
                  <td data-label={t('invoices.col.issue')}>{formatDate(inv.issueDate, lang)}</td>
                  <td data-label={t('invoices.col.due')}>{formatDate(inv.dueDate, lang)}</td>
                  <td data-label={t('invoices.col.status')}>
                    <span className={'badge badge-' + inv.status.toLowerCase()}>
                      {t('status.' + inv.status)}
                    </span>
                    {inv.status === 'Overdue' && (
                      <div className="muted">
                        {t('invoices.daysOverdue', { count: daysOverdue(inv, today) })}
                      </div>
                    )}
                    {inv.status === 'Paid' && (
                      <div className="muted">
                        {t('invoices.paidOn', { date: formatDate(inv.paidDate, lang) })}
                      </div>
                    )}
                  </td>
                  <td data-label={t('invoices.col.actions')} className="actions">
                    {inv.status !== 'Paid' && (
                      <button type="button" className="btn btn-small" onClick={() => onMarkPaid(inv.id)}>
                        {t('invoices.markPaid')}
                      </button>
                    )}
                    {inv.status === 'Overdue' && (
                      <button
                        type="button"
                        className="btn btn-small btn-ghost"
                        onClick={() => {
                          setCopied(false);
                          setReminderFor(inv);
                        }}
                      >
                        {t('invoices.draftReminder')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>{t('bills.upcoming')}</h2>
        {upcoming.length === 0 ? (
          <p className="muted">{t('bills.empty')}</p>
        ) : (
          <ul className="list">
            {upcoming.map(b => (
              <li key={b.id}>
                <span>{b.name}</span>
                <span>{formatINR(b.amount)} · {formatDate(b.dueDate, lang)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {reminderFor && (
        <div className="modal-overlay" onClick={() => setReminderFor(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reminder-title"
            onClick={e => e.stopPropagation()}
          >
            <h2 id="reminder-title">{t('reminder.title')}</h2>
            <textarea
              readOnly
              rows={6}
              value={message}
              onFocus={e => e.target.select()}
            />
            <p className="muted">{t('reminder.overdueNote')}</p>
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={copyMessage}>
                {copied ? t('reminder.copied') : t('reminder.copy')}
              </button>
              <button type="button" className="btn" onClick={() => setReminderFor(null)}>
                {t('reminder.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
