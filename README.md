# Sweety

A warm, approachable blood glucose notebook with a React client and a JWT protected Express API. Readings belong to individual accounts, use PostgreSQL `DATE` values, and are summarized for daily and monthly views.

## Stack and prerequisites

Node.js 20+, npm 10+, and PostgreSQL 14+ are required. PostgreSQL can be installed directly on Windows; Docker is not required. The app uses Express, `pg` with parameterized SQL, bcrypt, JWT, Zod, React, Vite, and React Router.

## Install and configure

```powershell
npm install
Copy-Item .env.example .env
```

Edit the two database URLs in `.env` with the username, password, host, and port of your installed PostgreSQL server. This app uses separate `sweety` and `sweety_test` databases. Create them from PowerShell (change the port if your PostgreSQL installation uses a different one):

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h localhost -p 5433 -U postgres -d postgres -c 'CREATE DATABASE sweety;'
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h localhost -p 5433 -U postgres -d postgres -c 'CREATE DATABASE sweety_test;'
npm run migrate
npm run migrate:test
npm run seed
npm run dev
```

The SQL commands create empty databases; run them only once. The migration commands create the app tables. The seed command adds the demo account and readings. Change `JWT_SECRET` before using the app beyond local development. If PostgreSQL was installed in another folder or uses another port, adjust the psql path and `.env` connection URLs.

To run tests against the separate test database, prepare its schema first:

```powershell
npm run migrate:test
npm test
```

The migration creates users, readings, the slot/value constraints, and the user/date index. The API returns `503` from `/health` if it cannot connect to the configured database. The test suite cleans test-prefixed accounts from `sweety_test`.

## Run it

```sh
npm run dev       # Express API and Vite client
npm run build     # production client build
npm run seed      # idempotent demo data (run after migration)
npm run migrate:test  # initialize the separate test database
npm test
```

The API defaults to `http://localhost:3000`; Vite defaults to `http://localhost:5173`. To run either separately, use `npm run dev -w server` or `npm run dev -w client`. Vite reads `VITE_API_URL` from the root `.env`.

Demo account: `demo@sweety.app` / `Demo@1234`.

## API

All reading and report routes require `Authorization: Bearer <token>`. The user ID always comes from the verified JWT.

| Method | Path                                        | Purpose                                   |
| ------ | ------------------------------------------- | ----------------------------------------- |
| POST   | `/auth/register`                            | Create an account; returns user and token |
| POST   | `/auth/login`                               | Sign in; returns user and token           |
| GET    | `/auth/me`                                  | Current account                           |
| GET    | `/readings?date=YYYY-MM-DD&page=1&limit=20` | List this user's readings                 |
| POST   | `/readings`                                 | Create `{ date, slot, value }`            |
| PUT    | `/readings/:id`                             | Update an owned reading                   |
| DELETE | `/readings/:id`                             | Delete an owned reading                   |
| GET    | `/reports/daily?date=YYYY-MM-DD`            | Daily stats and slot-ordered readings     |
| GET    | `/reports/month-to-date?date=YYYY-MM-DD`    | First of month through selected date      |
| GET    | `/reports/monthly?date=YYYY-MM-DD`          | Whole previous calendar month             |

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

