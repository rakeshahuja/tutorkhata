import { formatCurrency, formatDate } from '../lib/money.js';

export default function ForecastChart({ days, altDays, lang, t }) {
  if (!days || days.length === 0) return null;

  const n = days.length;
  const step = 576 / n;
  const cx = (i) => 52 + i * step + step / 2;

  const vals = [
    ...days.map((d) => d.balance),
    ...(altDays ? altDays.map((d) => d.balance) : []),
  ];
  const min = Math.min(0, ...vals);
  let max = Math.max(0, ...vals);
  if (max === min) max = min + 1;
  const yB = (v) => 160 - ((v - min) / (max - min)) * 148;

  const balancePoints = days.map((d, i) => `${cx(i)},${yB(d.balance)}`).join(' ');
  const altPoints = altDays
    ? altDays.map((d, i) => `${cx(i)},${yB(d.balance)}`).join(' ')
    : '';

  const maxFlow = Math.max(1, ...days.map((d) => Math.max(d.cashIn, d.cashOut)));
  const h = (v) => (v / maxFlow) * 56;
  const bw = Math.max(1, step * 0.35);

  return (
    <svg viewBox="0 0 640 260" width="100%" role="img" aria-label={t('forecast.chartTitle')} className="forecast-svg">
      <line x1="52" x2="628" y1={yB(0)} y2={yB(0)} stroke="#CBD5E1" strokeDasharray="4 4" />
      <polyline points={balancePoints} stroke="#0F766E" strokeWidth="2.5" fill="none" />
      {altDays && (
        <polyline points={altPoints} stroke="#F97316" strokeWidth="2" strokeDasharray="6 4" fill="none" />
      )}
      <text x="4" y="16" fontSize="10" fill="#64748B">{formatCurrency(max, lang)}</text>
      <text x="4" y="160" fontSize="10" fill="#64748B">{formatCurrency(min, lang)}</text>

      {days.map((d, i) => (
        <g key={i}>
          <rect className="cash-in" x={cx(i) - bw} y={236 - h(d.cashIn)} width={bw} height={h(d.cashIn)} fill="#0F766E" />
          <rect className="cash-out" x={cx(i)} y={236 - h(d.cashOut)} width={bw} height={h(d.cashOut)} fill="#F97316" />
        </g>
      ))}

      <text x="52" y="252" textAnchor="start" fontSize="10" fill="#64748B">{formatDate(days[0].date, t, lang)}</text>
      <text x="628" y="252" textAnchor="end" fontSize="10" fill="#64748B">{formatDate(days[n - 1].date, t, lang)}</text>
    </svg>
  );
}
