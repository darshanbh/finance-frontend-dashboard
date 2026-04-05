# 💰 Zorvyn Finance Dashboard – Smart Financial Analytics System

🚀 **Live Demo:**
👉 https://fintrack-pro-2026.netlify.app/

---

## 📌 Overview

A modern, interactive **finance dashboard** built using React that helps users track income, expenses, and financial insights with role-based access control.

---

## 🚀 Features

* 📊 **Dashboard Overview** – Balance, income, expense & savings insights
* 📈 **Charts & Analytics** – Area, Bar & Pie charts using Recharts
* 🔍 **Transaction Management** – Add, edit, delete, search, filter & sort
* 🔐 **Role-Based Access Control (RBAC)** – Admin & Viewer roles
* 💾 **LocalStorage Persistence** – Data saved across sessions
* 📤 **Export Data** – Download transactions as CSV / JSON
* 🌙 **Dark & Light Mode** – Fully theme-supported UI
* 📱 **Responsive Design** – Works on mobile, tablet & desktop

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite
* **Styling:** Tailwind CSS
* **Charts:** Recharts
* **Icons:** Lucide React
* **State Management:** Context API + useReducer
* **Storage:** LocalStorage

---

## 🧠 Key Concepts Used

* Modular component architecture
* Role-Based Access Control (RBAC)
* Dynamic filtering & sorting
* State management using reducer pattern
* Theme switching using CSS variables
* Responsive UI design

---

## 📂 Project Structure

```
src/
 ├── components/
 │   ├── layout/       Sidebar, Topbar
 │   ├── pages/        Overview, Transactions, Reports, Settings
 │   └── ui/           Modal
 ├── context/          Global state management
 ├── data/             Mock data
 ├── utils/            Helper functions
 └── App.jsx
```

---

## ▶️ Run Locally

```bash
npm install
npm run dev
```

Open: http://localhost:5173

---

## ⚠️ Known Limitations

* No backend integration (frontend-only project)
* No authentication system (demo RBAC only)
* No real-time database

---

## 🚀 Future Improvements

* Backend integration (Node.js + MongoDB)
* JWT authentication
* Real-time data sync
* Performance optimization

---
