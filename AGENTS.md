# Music Player workspace agent guidance

This repository is a hybrid workspace with a Next.js frontend app under `music-app/` and a Prisma database schema at the root.

## What to edit first
- Frontend source: `music-app/app/`
- Auth flows: `music-app/app/auth/`
- Player screens: `music-app/app/player/`
- Styling: `music-app/app/globals.css`
- Static assets: `music-app/public/`
- Database schema: `prisma/schema.prisma`

## Build and run
- Install dependencies at the root and app level as needed.
- Run the frontend from `music-app/` with `npm run dev`.
- Use `npm run build`, `npm run start`, `npm run lint`, and `npm run lint:fix` from `music-app/`.

## Key conventions
- The frontend uses Next.js 16 with the App Router, React 19, TypeScript, and Tailwind CSS v4.
- Keep page and layout logic inside `music-app/app/` and avoid adding server routes unless the user explicitly asks for backend/API work.
- The root `package.json` is primarily for Prisma dependencies; it is not the main frontend package manifest.

## Prisma and backend context
- The repository defines Prisma models in `prisma/schema.prisma` and config in `prisma.config.ts`.
- Models include `User`, `Artist`, `Album`, `Song`, `Playlist`, `PlaylistSong`, `LibrarySong`, and `PuzzleScore`.
- If database integration is added, align new server code with these models and do not change schema structure unless the user asks.

## Agent notes
- Preserve the existing Next.js warning in `music-app/AGENTS.md`.
- Prefer working inside `music-app/` for UI tasks and reference the root Prisma schema for data modeling.
- If the user wants to add backend features, verify whether they want a Next.js API route or a separate service.
