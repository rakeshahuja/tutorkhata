import { useI18n } from '../lib/i18n.jsx';

export default function Dashboard() {
  const { t } = useI18n();
  return (
    <section className="page">

      <div className="card">
        <p className="muted">{t('dashboard.comingSoon')}</p>
      </div>
    </section>
  );
}
