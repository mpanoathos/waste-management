# Smart Waste Management System

A full-stack platform for managing waste collection between **residents (users)**, **waste-collection companies**, and **administrators**. It tracks smart bins (fill level, location, IoT sensor data), collection requests/history, payments, collection routes, support/report threads, and an AI chat assistant, with real-time updates over Socket.io.

The repo is split into two apps:

```
waste-management/
├── waste-mgt-bn/   # Backend — Node.js, Express, Prisma, PostgreSQL, Socket.io
└── waste-mgt-fn/   # Frontend — React (CRA), Tailwind CSS, Chart.js, Leaflet/Google Maps
```

## Tech Stack

**Backend** (`waste-mgt-bn`)
- Express 4 REST API + Socket.io (real-time bin/sensor updates)
- Prisma ORM + PostgreSQL
- JWT authentication (`jsonwebtoken`, `bcrypt`)
- Nodemailer (password reset emails)
- OpenAI SDK (AI chat assistant)
- Payspack (mobile money payment provider)
- `serialport` (optional hardware sensor integration)

**Frontend** (`waste-mgt-fn`)
- React 19 + React Router 7 (Create React App / `react-scripts`)
- Tailwind CSS
- Chart.js / `react-chartjs-2` (analytics dashboards)
- Leaflet + `react-leaflet` and `@react-google-maps/api` (bin/route maps)
- Socket.io client (live bin status)
- `@react-pdf/renderer` (report export)

## Features

- **Auth & roles** — register/login, password reset, role-based access (`USER`, `COMPANY`, `ADMIN`), company approval workflow
- **Bin management** — fill-level tracking, coordinates, alerting the assigned company, pending pickup requests
- **Collection routes** — route creation, assignment to companies, per-company route view
- **Payments** — Payspack-based mobile money payments, payment history, admin payment reports
- **Analytics** — dashboards for users, companies, and admins (bins, collections, users, payments)
- **Report threads** — user-to-admin support conversations
- **AI chat assistant** — in-app chatbot for user support
- **Real-time updates** — live bin/sensor status via Socket.io

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm

## Getting Started

### 1. Backend (`waste-mgt-bn`)

```bash
cd waste-mgt-bn
npm install
```

Create a `.env` file (see [Environment Variables](#environment-variables) below), then run the Prisma migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

Start the server:

```bash
npm start
```


### 2. Frontend (`waste-mgt-fn`)

```bash
cd waste-mgt-fn
npm install
```

Create a `.env` file (see below), then start the dev server:

```bash
npm start
```


## Environment Variables

### `waste-mgt-bn/.env`

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (used by Prisma) |
| `NODE_ENV` | `development` / `production` |
| `FRONTEND_URL` | URL of the deployed frontend (used for CORS / email links) |
| `API_URL` | Public URL this backend is reachable at (used by `config/sensorListener.js`) |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `EMAIL_USER` / `EMAIL_PASS` | Credentials for sending password-reset emails |
| `PAYSPACK_APP_ID` / `PAYSPACK_APP_SECRET` | Payspack payment provider credentials |

### `waste-mgt-fn/.env`

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Base URL of the backend API |
| `REACT_APP_GOOGLE_MAPS_API_KEY` | Google Maps API key, used on map views |

> **Note:** the values above (`localhost:5000` / `localhost:3000`) are local-development defaults only. The apps never hardcode these URLs in source — everything is read from these environment variables, so when you host the project, set `FRONTEND_URL` / `API_URL` (backend) and `REACT_APP_API_URL` (frontend) to your actual deployed domains (e.g. via your hosting provider's environment variable settings).

## Test Users

Use the following accounts to log in and explore the app in a development/demo environment:

| Role | Email | Password |
|---|---|---|
| User | `user@gmail.com` | `Test@123` |
| Company | `company@gmail.com` | `Test@123` |

> These accounts must exist in the target database — there is currently no seed script. Create them via the `/signup` page (or the `POST /user/register` endpoint) if they don't already exist. Company accounts require admin approval (`ApprovalStatus`) before they can log in.

## Project Structure

### Backend

```
waste-mgt-bn/
├── controllers/   # Request handlers (auth, bins, payments, analytics, chat, routes, reports...)
├── routes/        # Express route definitions, mounted in server.js
├── middleware/     
├── prisma/        # schema.prisma + migrations
├── utils/         # Email, auth helpers, error handling, mobile money service
└── server.js      # App entry point
```

### Frontend

```
waste-mgt-fn/
├── src/
│   ├── pages/       # Route-level pages (Login, Signup, Dashboard, admin/company views, ...)
│   ├── components/  # Shared components (e.g. Chatbot)
│   └── utils/       # API client, helpers
└── public/
```

## Testing

Backend tests (Jest):

```bash
cd waste-mgt-bn
npm test
```
