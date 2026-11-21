import { useCallback, useEffect, useState } from 'react';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Invoices from './pages/Invoices.jsx';
import Customers from './pages/Customers.jsx';
import Forecast from './pages/Forecast.jsx';
import { loadData, saveData, makeId } from './lib/storage.js';
import { todayISO } from './lib/dates.js';
import { normalizeInvoices } from './lib/status.js';

function withStatus(data) {
  return { ...data, invoices: normalizeInvoices(data.invoices, todayISO()) };
}

export default function App() {
  const [data, setDataState] = useState(() => withStatus(loadData()));
  const [page, setPage] = useState('dashboard');

  // Accepts either a new data object or an updater function.
  const setData = useCallback((update) => {
    setDataState((prev) => withStatus(typeof update === 'function' ? update(prev) : update));
  }, []);

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Re-derive statuses every minute so invoices flip to Overdue at midnight.
  useEffect(() => {
    const id = setInterval(() => setDataState((prev) => withStatus(prev)), 60000);
    return () => clearInterval(id);
  }, []);

  const onAddCustomer = (customer) =>
    setData((d) => ({ ...d, customers: [...d.customers, { id: makeId(), ...customer }] }));

  const onCreateInvoice = (invoice) =>
    setData((d) => ({
      ...d,
      invoices: [...d.invoices, { id: makeId(), status: 'Pending', paidDate: null, ...invoice }],
    }));

  const onMarkPaid = (id) =>
    setData((d) => ({
      ...d,
      invoices: d.invoices.map((i) => (i.id === id ? { ...i, paidDate: todayISO() } : i)),
    }));

  let content;
  if (page === 'invoices') {
    content = (
      <Invoices
        customers={data.customers}
        invoices={data.invoices}
        bills={data.bills}
        onCreateInvoice={onCreateInvoice}
        onMarkPaid={onMarkPaid}
      />
    );
  } else if (page === 'customers') {
    content = <Customers customers={data.customers} onAddCustomer={onAddCustomer} />;
  } else if (page === 'forecast') {
    content = <Forecast />;
  } else {
    content = <Dashboard />;
  }

  return (
    <Layout page={page} onNavigate={setPage}>
      {content}
    </Layout>
  );
}
