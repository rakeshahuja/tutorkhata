import { useEffect, useState } from 'react';
import './forecast.css';
import { useI18n } from '../lib/i18n.jsx';
import { todayISO } from '../lib/dates.js';
import { formatCurrency, formatDate, formatNumber, parseAmount } from '../lib/money.js';
import { getDisplayName } from '../lib/names.js';
import { buildForecast, suggestAction, getOpeningBalance, saveOpeningBalance } from '../lib/forecast.js';
import ForecastChart from '../components/ForecastChart.jsx';
import ForecastList from '../components/ForecastList.jsx';

export default function Forecast({ customers, invoices, bills }) {
  const { t, lang } = useI18n();
  const [period, setPeriod] = useState(30);
  const [opening, setOpening] = useState(getOpeningBalance);
  const [draft, setDraft] = useState(() => formatNumber(opening, lang));
  const [invalid, setInvalid] = useState(false);
  const [whatIfId, setWhatIfId] = useState('');
  const [whatIfDays, setWhatIfDays] = useState(15);

  useEffect(() => { setDraft(formatNumber(opening, lang)); setInvalid(false); }, [lang]);

  const today = todayISO();

  const base = buildForecast({ invoices, bills, customers, today, days: period, opening, delay: null });
  const alt = whatIfId
    ? buildForecast({ invoices, bills, customers, today, days: period, opening, delay: { customerId: whatIfId, days: whatIfDays } })
    : null;
  const delta = alt ? alt.lowest.balance - base.lowest.balance : 0;

  function onOpeningChange(value) {
    setDraft(value);
    const n = parseAmount(value);
    if (Number.isNaN(n)) { setInvalid(true); return; }
    setInvalid(false);
    setOpening(n);
    saveOpeningBalance(n);
  }

  function actionText(result) {
    const action = suggestAction(result);
    if (!action) return '';
    if (action.kind === 'chase') {
      return t('forecast.actionChase', {
        name: getDisplayName(action.item.entity, lang),
        amount: formatCurrency(action.item.amount, lang),
      });
    }
    return t('forecast.actionReview');
  }

  const warnings = [base, alt].filter(r => r && r.firstNegative);

  return (
    <section className="page">
      <div className="forecast-top">
        <div className="card opening-card">
          <label htmlFor="opening-input">{t('forecast.openingBalance')}</label>
          <input
            id="opening-input"
            type="text"
            inputMode="numeric"
            value={draft}
            onChange={e => onOpeningChange(e.target.value)}
          />
          <span className="muted">{t('forecast.openingHelp')}</span>
          {invalid && <span className="error" role="alert">{t('forecast.openingInvalid')}</span>}
        </div>

        <div className="period-toggle" role="group">
          {[30, 60, 90].map(p => (
            <button key={p} type="button" aria-pressed={period === p} onClick={() => setPeriod(p)}>
              {t('forecast.periodDays', { count: p })}
            </button>
          ))}
        </div>
      </div>

      <div className="summary-grid">
        <div className="card summary-card">
          <div className="summary-label">{t('forecast.cashIn')}</div>
          <div className="summary-value">{formatCurrency(base.totalIn, lang)}</div>
        </div>
        <div className="card summary-card">
          <div className="summary-label">{t('forecast.cashOut')}</div>
          <div className="summary-value overdue">{formatCurrency(base.totalOut, lang)}</div>
        </div>
        <div className="card summary-card">
          <div className="summary-label">{t('forecast.endBalance')}</div>
          <div className={'summary-value' + (base.endBalance < 0 ? ' overdue' : '')}>
            {formatCurrency(base.endBalance, lang)}
          </div>
        </div>
        <div className="card summary-card">
          <div className="summary-label">{t('forecast.lowestBalance')}</div>
          <div className={'summary-value' + (base.lowest.balance < 0 ? ' overdue' : '')}>
            {formatCurrency(base.lowest.balance, lang)}
          </div>
          <div className="summary-sub">{t('forecast.lowestOn', { date: formatDate(base.lowest.date, t, lang) })}</div>
        </div>
      </div>

      {warnings.length === 0 ? (
        <div className="card safe-card">
          <p className="muted">{t('forecast.safeBody')}</p>
        </div>
      ) : (
        warnings.map(r => (
          <div key={r.firstNegative} className="card warning-card">
            <h2>{t('forecast.negativeTitle', { date: formatDate(r.firstNegative, t, lang) })}</h2>
            <p>{t('forecast.negativeBody', { amount: formatCurrency(r.lowest.balance, lang), action: actionText(r) })}</p>
          </div>
        ))
      )}

      <div className="card chart-card">
        <h2>{t('forecast.chartTitle')}</h2>
        <ForecastChart days={base.days} altDays={alt ? alt.days : null} lang={lang} t={t} />
        <div className="chart-legend">
          <span><span className="legend-dot legend-in" />{t('forecast.legendIn')}</span>
          <span><span className="legend-dot legend-out" />{t('forecast.legendOut')}</span>
          <span><span className="legend-dot legend-balance" />{t('forecast.legendBalance')}</span>
          {alt && <span><span className="legend-dot legend-after" />{t('forecast.legendAfter')}</span>}
        </div>
      </div>

      <div className="card">
        <h2>{t('forecast.whatIfTitle')}</h2>
        <div className="whatif-grid">
          <div className="field">
            <label htmlFor="whatif-customer">{t('forecast.whatIfCustomer')}</label>
            <select id="whatif-customer" value={whatIfId} onChange={e => setWhatIfId(e.target.value)}>
              <option value="">{t('forecast.whatIfPick')}</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{getDisplayName(c, lang)}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="whatif-days">{t('forecast.whatIfDelay')}</label>
            <select id="whatif-days" value={whatIfDays} onChange={e => setWhatIfDays(Number(e.target.value))}>
              {[7, 15, 30].map(d => (
                <option key={d} value={d}>{t('forecast.delayDays', { count: d })}</option>
              ))}
            </select>
          </div>
        </div>

        {alt && (
          <div className="compare-grid">
            <div className="compare-cell">
              <span className="muted">{t('forecast.before')}</span>
              <span className="compare-value">{formatCurrency(base.lowest.balance, lang)}</span>
              <span className="muted">{t('forecast.lowestOn', { date: formatDate(base.lowest.date, t, lang) })}</span>
            </div>
            <div className="compare-cell">
              <span className="muted">{t('forecast.after')}</span>
              <span className="compare-value">{formatCurrency(alt.lowest.balance, lang)}</span>
              <span className="muted">{t('forecast.lowestOn', { date: formatDate(alt.lowest.date, t, lang) })}</span>
            </div>
            <div className="compare-cell">
              <span className="muted">{t('forecast.difference')}</span>
              <span className={'compare-value ' + (delta > 0 ? 'delta-up' : delta < 0 ? 'delta-down' : '')}>
                {delta === 0 ? t('forecast.noChange') : (delta > 0 ? '+ ' : '− ') + formatCurrency(Math.abs(delta), lang)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>{t('forecast.upcomingTitle')}</h2>
        <ForecastList items={base.items} lang={lang} t={t} />
      </div>
    </section>
  );
}
