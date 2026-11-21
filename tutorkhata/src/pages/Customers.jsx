import { useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { formatINR } from '../lib/money.js';

export default function Customers({ customers, onAddCustomer }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [fee, setFee] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSuccess(false);
    const trimmed = name.trim();
    if (!trimmed) {
      setError('validation.nameRequired');
      return;
    }
    const amount = Number(fee);
    if (!(amount > 0)) {
      setError('validation.feeInvalid');
      return;
    }
    setError('');
    onAddCustomer({ name: trimmed, monthlyFee: amount });
    setName('');
    setFee('');
    setSuccess(true);
  }

  return (
    <section className="page">
      <div className="card">
        <h2>{t('customers.addTitle')}</h2>
        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="cust-name">{t('customers.name')}</label>
            <input
              id="cust-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="cust-fee">{t('customers.monthlyFee')}</label>
            <input
              id="cust-fee"
              type="number"
              inputMode="numeric"
              min="1"
              value={fee}
              onChange={e => setFee(e.target.value)}
            />
          </div>
          {error && <p className="error" role="alert">{t(error)}</p>}
          {success && <p className="success">{t('customers.added')}</p>}
          <button type="submit" className="btn btn-primary">{t('customers.add')}</button>
        </form>
      </div>

      <div className="card">
        <h2>{t('customers.listTitle')}</h2>
        {customers.length === 0 ? (
          <p className="muted">{t('customers.empty')}</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t('customers.col.name')}</th>
                <th>{t('customers.col.fee')}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="stack-row">
                  <td data-label={t('customers.col.name')}>{c.name}</td>
                  <td data-label={t('customers.col.fee')}>{formatINR(c.monthlyFee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
