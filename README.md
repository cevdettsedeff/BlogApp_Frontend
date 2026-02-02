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

## Environment Variables
Create a `.env.local` file if needed. Example:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
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
