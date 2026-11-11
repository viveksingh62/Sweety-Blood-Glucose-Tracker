# Sweety

A warm, approachable blood glucose notebook with a React client and a JWT protected Express API. Readings belong to individual accounts, use PostgreSQL `DATE` values, and are summarized for daily and monthly views.

## Stack and prerequisites

Node.js 20+, npm 10+, and PostgreSQL 14+ are required. The app uses Express, `pg` with parameterized SQL, bcrypt, JWT, Zod, React, Vite, and React Router.

## Install and configure

```sh
npm install
cp .env.example .env
```

Set a private `JWT_SECRET` in `.env`, and update the database connection strings to match your local PostgreSQL account. Create both the application and test databases:

```sh
createdb sweety
createdb sweety_test
npm run migrate
```

The migration creates users, readings, the slot/value constraints, and the user/date index. Set `TEST_DATABASE_URL` to the separate `sweety_test` database before running API integration tests. The suite cleans test-prefixed accounts in that database.

## Run it

```sh
npm run dev       # Express API and Vite client
npm run build     # production client build
npm test          # date utility and API tests
npm run seed      # idempotent demo data
```

The API defaults to `http://localhost:3000`; Vite defaults to `http://localhost:5173`. To run either separately, use `npm run dev -w server` or `npm run dev -w client`. Vite reads `VITE_API_URL` from the root `.env`.

Demo account: `demo@sweety.app` / `Demo@1234`.

## API

All reading and report routes require `Authorization: Bearer <token>`. The user ID always comes from the verified JWT.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create an account; returns user and token |
| POST | `/auth/login` | Sign in; returns user and token |
| GET | `/auth/me` | Current account |
| GET | `/readings?date=YYYY-MM-DD&page=1&limit=20` | List this user's readings |
| POST | `/readings` | Create `{ date, slot, value }` |
| PUT | `/readings/:id` | Update an owned reading |
| DELETE | `/readings/:id` | Delete an owned reading |
| GET | `/reports/daily?date=YYYY-MM-DD` | Daily stats and slot-ordered readings |
| GET | `/reports/month-to-date?date=YYYY-MM-DD` | First of month through selected date |
| GET | `/reports/monthly?date=YYYY-MM-DD` | Whole previous calendar month |

Slots: `morning`, `after_breakfast`, `after_lunch`, `after_dinner`. Dates use `YYYY-MM-DD`.

## Validation order

Reading writes check required value and request formats first, then reject future dates, then enforce the four-per-day limit, then check for a duplicate slot. Thus an over-limit day reports the daily limit before a duplicate slot. An update excludes its own row from both checks. A database unique violation is also mapped to the duplicate-slot message for race safety. Validation errors use `{ "error": { "code", "message", "field" } }`; input errors use 400 and duplicate/limit conflicts use 409. The same configured timezone is used for “today” and future-date checks.

## Notes

- Status bands (low below 70; in range 70–180; high above 180 mg/dl) are display guidance only, not medical advice or backend validation.
- `APP_TIMEZONE` defaults to `Asia/Kolkata`; PostgreSQL `DATE` is parsed as a date string to avoid timezone shifts.
- JWT is stored in `localStorage` for assignment simplicity. An `httpOnly`, secure cookie with a refresh-token strategy is preferable in production.
- Passwords are bcrypt hashed with cost 10. Auth routes use rate limiting, and Helmet sets standard security headers.

### What I'd improve with more time

Refresh tokens, a clinician/doctor role, report caching, end-to-end tests, and CI.

## Screenshots / screen recording

_Placeholder: add screenshots or a short screen recording here._
