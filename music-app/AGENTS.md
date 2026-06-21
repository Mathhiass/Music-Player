<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

This file is the app-level Next.js guidance for `music-app/`.

Project context:
- Next.js 16, React 19, TypeScript, Tailwind CSS v4.
- Frontend source is under `app/`; auth is in `app/auth/`; player screens are in `app/player/`.
- Run commands from `music-app/`: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run lint:fix`.

Workspace note:
- The root repository also contains Prisma schema and config in `prisma/`.
- For workspace-level build or database guidance, refer to top-level `AGENTS.md`.
