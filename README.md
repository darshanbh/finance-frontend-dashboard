<<<<<<< HEAD
# finance-frontend-dashboard
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Flo — Finance Dashboard

A clean, interactive personal finance dashboard built with **React + Vite + Tailwind CSS**.

---

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173
```

---

## Project Structure

```
flo-finance/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx                        Entry point
    ├── App.jsx                         Root shell + page router
    ├── index.css                       Tailwind + global component classes
    ├── context/
    │   └── AppContext.jsx              Global state (useReducer + localStorage)
    ├── data/
    │   └── mockData.js                 84 seed transactions + CATEGORIES config
    ├── utils/
    │   └── helpers.js                  Formatting, chart data builders, export
    └── components/
        ├── layout/
        │   ├── Sidebar.jsx             Navigation + role switcher + theme toggle
        │   └── Topbar.jsx              Header + export dropdown + add button
        ├── ui/
        │   └── Modal.jsx               Add / Edit transaction modal (fully complete)
        └── pages/
            ├── Overview.jsx            Dashboard: stat cards + charts + recent txns
            ├── Transactions.jsx        Full table: search + filter + sort + edit/delete
            ├── Reports.jsx             Insights cards + savings chart + category breakdown
            └── Settings.jsx            Profile, role, theme, notifications, data management
```

---

## Features

| Feature | Details |
|---|---|
| **Overview** | 4 stat cards, balance trend chart (area/bar toggle), spending pie chart, recent transactions |
| **Transactions** | Full table, search by name/category, filter by type + category, sort by any column, edit/delete |
| **Reports** | 6 auto-generated insight cards, savings line chart, category bar + progress bars, monthly comparison table |
| **Settings** | Profile form, role switcher, theme toggle, export CSV/JSON, import JSON, reset data |
| **RBAC** | Admin = full access. Viewer = read-only. Role persists in localStorage |
| **LocalStorage** | Transactions and role saved across refreshes |
| **Export** | CSV and JSON download from topbar (respects active filters) |
| **Responsive** | Mobile sidebar drawer, stacked cards, horizontal table scroll |

---

## Tech Stack

| | |
|---|---|
| React 18 | UI |
| Vite 5 | Build tool |
| Tailwind CSS 3 | Styling |
| Recharts | Charts (Area, Bar, Line, Pie) |
| Lucide React | Icons |
| Context + useReducer | State management |
>>>>>>> 5c4acbd (Intial commit)
