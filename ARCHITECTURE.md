# ARCHITECTURE & CODING RULES (STRICT INTERVIEW-SAFE MODE)

## 1. Core Philosophy
The developer must explain EVERY single line of code in a live technical evaluation interview. 
Prioritize explicit, readable, textbook code over clever framework abstractions.

## 2. Backend Rules (Python + FastAPI + SQLite)
- **Database Access:** Use Python's built-in `sqlite3` module with `sqlite3.Row` (dictionary-like row access) and explicit parameterized SQL queries (`?` placeholders). DO NOT use SQLAlchemy, TortoiseORM, or Alembic migrations.
- **Why Raw SQL:** Raw SQL queries (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`) are 100% transparent and easy to explain line-by-line.
- **JSON Columns:** Store array fields (`images` and `amenities` on `listings`) as JSON strings in SQLite using `json.dumps()` and `json.loads()`.
- **Date Overlap Formula:** Always use standard Allen's Interval Algebra for booking conflicts (where check_out is exclusive):
  `existing_check_in < new_check_out AND existing_check_out > new_check_in`
- **API Structure:** Keep FastAPI routes clean and flat inside `backend/main.py`, with database initialization in `backend/database.py` and seed data in `backend/seed.py`. Use simple Pydantic `BaseModel` classes for request bodies.

## 3. Frontend Rules (Next.js + TypeScript + Tailwind CSS)
- **App Router with Client Components:** Use Next.js App Router (`src/app/...`), but put `'use client'` at the top of interactive pages and components.
- **Data Fetching:** Use standard `useState`, `useEffect`, and native `fetch()` to call the FastAPI backend (`http://localhost:8000/api/...`). DO NOT use React Server Actions, TanStack Query/SWR, Redux, or Zustand.
- **TypeScript:** Keep TypeScript strictly limited to simple `interface` definitions (e.g., `interface Listing`, `interface Booking`) in a single `src/types/index.ts` file. Never use complex generics (`Partial<Record<keyof T, ...>>`).
- **Icons:** Use `lucide-react` exclusively for clean, consistent icons.