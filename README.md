# Pharmacy Inventory & Sales Management App

This repository contains a full-stack pharmacy management system with separate frontend and backend folders.

## Stack

- Frontend: React + Vite + TailwindCSS + Recharts
- Backend: Node.js + Express + MongoDB + JWT

## Project Structure

- `frontend/` React app with dashboard, inventory, POS, suppliers, purchases, dark/light mode
- `backend/` Express API with auth, inventory, sales, suppliers, purchases, analytics, notifications endpoints

## Features Implemented

- JWT login (`admin` seeded automatically on backend startup)
- Role-aware protected API endpoints (`admin`, `pharmacist`)
- Medicine inventory CRUD with search/filter support and stock/expiry alerts
- Sales POS flow with cart, discounts, payment method, stock deduction
- Supplier management CRUD
- Purchase recording with stock increase
- Expiry tracking (`expired`, `expiring soon`, configurable day window)
- Dashboard analytics:
  - Daily/weekly/monthly sales
  - Best-selling medicines
  - Sales by category
  - Sales by staff
  - Low stock, expired medicines, inventory value
  - Revenue/cost/profit summary
- Tailwind-based responsive UI with light/dark mode toggle

## Backend Setup

1. Go to `/Users/amalitech-pc-10164/Documents/GitHub/react-apps/pharmacy/backend`
2. Install dependencies:

```bash
npm install
```

3. Create env file:

```bash
cp .env.example .env
```

4. Start backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000` by default.

## Frontend Setup

1. Go to `/Users/amalitech-pc-10164/Documents/GitHub/react-apps/pharmacy/frontend`
2. Install dependencies:

```bash
npm install
```

3. Create env file:

```bash
cp .env.example .env
```

4. Start frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Default Admin Login

- Email: `admin@pharmacy.com`
- Password: `admin123`

These are controlled by backend env values:
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `SEED_ADMIN_NAME`

## API Base Routes

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/register` (admin only)
- `GET/POST/PUT/DELETE /api/medicines`
- `GET /api/medicines/alerts?days=30`
- `GET/POST/PUT/DELETE /api/suppliers`
- `GET/POST /api/purchases`
- `GET/POST /api/sales`
- `GET /api/analytics/dashboard`
- `GET /api/analytics/sales-categories`
- `GET /api/analytics/movement`

## Notes

- A MongoDB replica set is recommended for transaction support used in purchase/sale flows.
- This implementation is a strong MVP baseline and can be extended with receipt printing, audit logs, advanced RBAC, and stricter validations.
