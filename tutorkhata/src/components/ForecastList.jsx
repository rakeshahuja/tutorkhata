import { formatCurrency, formatDate } from '../lib/money.js';
import { getDisplayName } from '../lib/names.js';

export default function ForecastList({ items, lang, t }) {
  if (!items || items.length === 0) {
    return <p className="muted">{t('forecast.upcomingEmpty')}</p>;
  }

  return (
    <ul className="list forecast-list">
      {items.map((item, index) => (
        <li className="forecast-row" key={index}>
          <span className="forecast-date">{formatDate(item.date, t, lang)}</span>
          <span className="forecast-name">{getDisplayName(item.entity, lang)}</span>
          <span className={'badge ' + (item.kind === 'in' ? 'badge-in' : 'badge-out')}>
            {t(item.kind === 'in' ? 'forecast.legendIn' : 'forecast.legendOut')}
          </span>
          {item.overdue && <span className="muted">{t('forecast.overdueToday')}</span>}
          {item.delayed && <span className="muted">{t('forecast.delayed')}</span>}
          <span className={'forecast-amount ' + (item.kind === 'in' ? 'amount-in' : 'amount-out')}>
            {item.kind === 'in' ? '+ ' : '− '}{formatCurrency(item.amount, lang)}
          </span>
        </li>
      ))}
    </ul>
  );
}
