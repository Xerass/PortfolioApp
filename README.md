PortfolioApp
=============

A compact Expo + TypeScript portfolio app (UI + small backend helpers).

Quick start
-----------
1. Install dependencies
   npm install

2. Start the dev server
   npm start    # or `expo start`

3. Open on device/emulator or web using the Expo dev tools.

Project layout (top-level)
--------------------------
- app/        — screens & routes (Next/Expo Router style)
- components/ — reusable UI components
- assets/     — images & fonts
- lib/        — helpers (supabase, auth)
- constants/  — colors and other constants
- types/      — custom TypeScript declarations

Notes
-----
- Environment variables: check `.env.local` for local secrets.
- Uses Supabase (see `lib/supabase.ts`) for backend/auth.
- Small test exists under `components/__tests__/`.
- Utilizes Google API for the chatbot
