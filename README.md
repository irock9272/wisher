# Wisher

Wisher is a small self-hostable wishlist service that writes new entries to Redis for instant updates and syncs them into MariaDB (via Prisma) for permanent storage.

Key ideas:
- No accounts or tracking.
- Local on-device data stored in `/wishes` (or a custom folder) — add to `.gitignore`.
- Add items instantly via Redis, then a background worker syncs to MariaDB.


Quick start (local, plug-and-play):

1. Install dependencies:

```fish
npm install
```

2. Generate Prisma client and apply migrations (creates a local SQLite DB file at `./wishes/wisher.db`):

```fish
npm run prisma:generate
# The migrate script creates `./wishes` before running migrations so the SQLite file can be created.
npm run prisma:migrate
```

3. Start dev server:

```fish
npm run dev
```

Open the web UI at: http://localhost:3000/ — the SPA includes filtering by person (chips), sorting, and the ability to add or mark wishes as bought.

API endpoints:
- `POST /wishes` { name, item, price, revealDate? }
- `GET /wishes`
- `POST /wishes/:id/buy` { boughtBy?, anonymous? }

Notes:
This scaffold uses a file-backed SQLite database so no `.env` or external DBs are required. The database file is created at `./wishes/wisher.db` (add this path to your `.gitignore` if you prefer to keep it private).

Persisted DB model is defined in `prisma/schema.prisma` and the app writes directly to the local SQLite database for instant updates.
