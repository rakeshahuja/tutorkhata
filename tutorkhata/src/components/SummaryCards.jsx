import { useI18n } from '../lib/i18n.jsx';
import { todayISO } from '../lib/dates.js';
import { formatCurrency, formatNumber } from '../lib/money.js';
import { deriveStatus } from '../lib/status.js';

export default function SummaryCards({ invoices }) {
  const { t, lang } = useI18n();
  const today = todayISO();
  const thisMonth = today.slice(0, 7);
  const withStatus = invoices.map(inv => ({ inv, status: deriveStatus(inv, today) }));
  const sumWhere = pred => withStatus.filter(pred).reduce((total, x) => total + Number(x.inv.amount), 0);
  const pendingTotal = sumWhere(x => x.status === 'Pending');
  const overdueTotal = sumWhere(x => x.status === 'Overdue');
  const collectedMonth = sumWhere(x => x.status === 'Paid' && String(x.inv.paidDate || '').startsWith(thisMonth));
  const overdueCount = withStatus.filter(x => x.status === 'Overdue').length;

  return (
    <>
      <div className="summary-grid">
        <div className="card summary-card"><div className="summary-label">{t('dashboard.pendingTotal')}</div><div className="summary-value">{formatCurrency(pendingTotal, lang)}</div></div>
        <div className="card summary-card"><div className="summary-label">{t('dashboard.overdueTotal')}</div><div className="summary-value overdue">{formatCurrency(overdueTotal, lang)}</div></div>
        <div className="card summary-card"><div className="summary-label">{t('dashboard.collectedMonth')}</div><div className="summary-value">{formatCurrency(collectedMonth, lang)}</div></div>
        <div className="card summary-card"><div className="summary-label">{t('dashboard.overdueCount')}</div><div className="summary-value overdue">{formatNumber(overdueCount, lang)}</div></div>
      </div>
      <p className="muted summary-help">{t('dashboard.summaryHelp')}</p>
    </>
  );
}
