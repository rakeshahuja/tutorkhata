# TutorKhata

**Fees ka hisaab, aasan.**

A one-person back office for a home tutor in India, built for the Codebenders ACE Builders Hackathon 2026, Problem Statement 1 (The One-Person Back Office).

## The problem

Small home tutors run their fees on WhatsApp and paper notebooks. Invoices go unchased, it is easy to lose track of who has paid, and it is hard to tell whether next month's cash will cover the rent and bills.

## Who it is for

A home tutor with about 5 to 15 students who wants to see who owes money, send a polite reminder, and check the month ahead, without accounting software.

## Features

- **Customers:** add a student or parent with a name and a monthly fee, and see the list.
- **Invoices:** create an invoice for a student; the amount fills in from their monthly fee. An unpaid invoice past its due date becomes **Overdue** automatically, and the days overdue are shown.
- **Mark as paid:** records the payment date on an invoice.
- **Reminder messages:** a polite message for an overdue invoice, shown in a dialog with a Copy button, ready to paste into WhatsApp.
- **Dashboard:** total pending, total overdue, collected this month and the number of overdue invoices; an "Action today" list of overdue invoices with Draft reminder and Mark as paid buttons; a "Who owes me" table, oldest first; and an "All caught up" message when nothing is overdue.
- **Forecast:** a 30, 60 or 90-day view of expected cash in (unpaid invoices by due date, overdue ones counted today) and expected cash out (bills by due date), with an editable opening balance, a chart and a list of upcoming cash movements.
- **What if a customer pays late:** pick a customer and a delay of 7, 15 or 30 days to compare the forecast before and after, and see the change in the lowest balance.
- **Negative balance warning:** if the projected balance drops below zero, the Forecast page shows the date and a suggested action, such as chasing an overdue invoice today.
- **Three languages:** English, हिन्दी and मराठी. The switch applies immediately and is remembered. Labels, names, numbers, dates and reminder messages follow the chosen language.

Bills (rent, internet, electricity) come from the sample data and appear in the Forecast and on the Invoices page.

## Screens

- Dashboard: _[screenshot to be added]_
- Invoices: _[screenshot to be added]_
- Customers: _[screenshot to be added]_
- Forecast: _[screenshot to be added]_

## Tech stack

- React 18 and Vite 5
- Data stored in the browser's localStorage (no backend)
- Translations in JSON files (English, Hindi, Marathi)
- Noto Sans Devanagari font from Google Fonts
- Forecast chart drawn as plain SVG (no charting library)

## How to run (Windows, PowerShell)

```powershell
cd tutorkhata
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

To create a production build:

```powershell
npm run build
```

## Project structure

```
tutorkhata/
├── index.html
├── public/              favicon.svg (used), logo.svg (not used by the app yet)
└── src/
    ├── App.jsx          page switching and data state
    ├── main.jsx         entry point
    ├── components/      Layout, SummaryCards, OwesTable, ActionToday, ForecastChart, ForecastList
    ├── pages/           Dashboard, Invoices, Customers, Forecast (with dashboard.css, forecast.css)
    ├── lib/             i18n, storage, dates, money, status, names, reminder, forecast
    ├── i18n/            en.json, hi.json, mr.json
    └── styles/          app.css
```

## Sample data

All students, invoices and bills are **fake sample data**, created by the app on first run (for example Aarav Sharma and Diya Patil). No real personal data is included. The app does not collect or store sensitive IDs, bank details or UPI details.

All data stays in your browser's localStorage, under the keys `tutorkhata.v1` (student, invoice and bill data), `tutorkhata.lang` (language) and `tutorkhata.forecast.opening` (opening balance). Clearing the site's data resets the app.

## Built with

Built with the **Codebenders IDE (Nexen AI)**, as required by the hackathon.

## Limitations and next steps

- No login and no cloud sync. Data lives in one browser on one device.
- No export or import of data yet.
- No screen yet to add or edit bills; bills come from the sample data only.
- The Hindi and Marathi wording has not yet been checked by a native speaker.
- Possible next steps: a real database, sending WhatsApp or SMS reminders, UPI payment links, recurring monthly invoices, and export/import for backup.

## Team

- **Team Name** - Khata Keepers
- **Team Member 1** - Rakesh Nanak Ahuja
- **Team Member 2** - Shivam Dinesh Patil
