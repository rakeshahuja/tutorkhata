import { useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { todayISO } from '../lib/dates.js';
import { formatCurrency } from '../lib/money.js';
import { deriveStatus, daysOverdue } from '../lib/status.js';
import { getDisplayName } from '../lib/names.js';
import { buildReminder } from '../lib/reminder.js';

export default function ActionToday({ customers, invoices, onMarkPaid }) {
  const { t, lang } = useI18n();
  const [reminderFor, setReminderFor] = useState(null);
  const [copied, setCopied] = useState(false);
  const today = todayISO();
  const overdue = invoices
    .filter(inv => deriveStatus(inv, today) === 'Overdue')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const customerById = id => customers.find(c => c.id === id);
  const items = overdue
    .map(inv => ({ inv, customer: customerById(inv.customerId) }))
    .filter(x => x.customer);

  function close() { setReminderFor(null); setCopied(false); }

  const reminderCustomer = reminderFor ? customerById(reminderFor.customerId) : null;
  const message = reminderFor && reminderCustomer
    ? buildReminder(t, lang, {
        customerName: getDisplayName(reminderCustomer, lang),
        amount: reminderFor.amount,
        dueDate: reminderFor.dueDate,
        days: daysOverdue(reminderFor, today),
      })
    : '';

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      const ta = document.querySelector('.modal textarea');
      if (ta) {
        ta.select();
        if (document.execCommand('copy')) setCopied(true);
      }
    }
  }

  if (items.length === 0) return (
    <div className="card all-caught-up">
      <h2>{t('dashboard.allCaughtUp')}</h2>
      <p className="muted">{t('dashboard.allCaughtUpSub')}</p>
    </div>
  );

  return (
    <>
      <div className="card">
        <h2>{t('dashboard.actionToday')}</h2>
        <div className="alert-list">
          {items.map(({ inv, customer }) => (
            <div className="alert-card" key={inv.id}>
              <div className="alert-text">
                {t('dashboard.chase', {
                  name: getDisplayName(customer, lang),
                  amount: formatCurrency(inv.amount, lang),
                  days: t('invoices.daysOverdue', { count: daysOverdue(inv, today) }),
                })}
              </div>
              <div className="actions">
                <button type="button" className="btn btn-small btn-ghost" onClick={() => { setCopied(false); setReminderFor(inv); }}>{t('invoices.draftReminder')}</button>
                <button type="button" className="btn btn-small btn-primary" onClick={() => onMarkPaid(inv.id)}>{t('invoices.markPaid')}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {reminderFor && reminderCustomer && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="action-reminder-title" onClick={e => e.stopPropagation()}>
            <h2 id="action-reminder-title">{t('reminder.title')}</h2>
            <textarea readOnly rows={6} value={message} onFocus={e => e.target.select()} />
            <p className="muted">{t('reminder.overdueNote')}</p>
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={copyMessage}>{copied ? t('reminder.copied') : t('reminder.copy')}</button>
              <button type="button" className="btn" onClick={close}>{t('reminder.close')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
