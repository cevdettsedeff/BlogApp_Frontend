# Blog Frontend

Modern blog frontend built with Next.js 14, Tailwind CSS, and TypeScript. Includes public pages and an admin panel UI.

## Features
- Multi-language routing (locale-based)
- Admin dashboard pages (posts, categories, users, comments, settings)
- Skeleton loading states
- Tailwind-based responsive UI

## Tech Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)

## Getting Started

### 1) Install dependencies
```
npm install
```

### 2) Run the dev server
```
npm run dev
```

Open http://localhost:3000 in your browser.

## Scripts
- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run start` — start production server
- `npm run lint` — run linting

## Docker
This repository now includes:
- `Dockerfile` for frontend (Next.js standalone output)
- `docker-compose.yml` for frontend + backend + PostgreSQL (compose file is in this folder)

Run:
```bash
# optional
copy .env.docker.example .env

docker compose up --build
```

Services:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Environment Variables
Create a `.env.local` file if needed. Example:
```
NEXT_PUBLIC_API_URL=https://localhost:7264
NEXT_PUBLIC_API_TIMEOUT_MS=10000
```

## Project Structure
```
src/
  app/
    (main)/
    (auth)/
    admin/
  components/
  hooks/
  lib/
  stores/
```

## Notes
- This repo currently uses mock data for admin pages.
- Authentication is mocked for development.

## License
MIT
