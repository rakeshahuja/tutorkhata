import './dashboard.css';
import SummaryCards from '../components/SummaryCards.jsx';
import OwesTable from '../components/OwesTable.jsx';
import ActionToday from '../components/ActionToday.jsx';

export default function Dashboard({ customers, invoices, onMarkPaid }) {
  return (
    <section className="page">
      <SummaryCards invoices={invoices} />
      <ActionToday customers={customers} invoices={invoices} onMarkPaid={onMarkPaid} />
      <OwesTable customers={customers} invoices={invoices} />
    </section>
  );
}
