# Doodle Interview — Chat Frontend

<div align="center">
  <h2>💬 chat-frontend</h2>
  <p>A chat interface for the Doodle interview home assignment challenge.</p>
  <p>Built by <a href="https://github.com/YOUR_GITHUB">Muhammad Zourdy</a></p>
</div>

---

## Overview

This is the frontend application for the Doodle frontend interview home assignment. It provides a real-time chat interface that communicates with the [Chat API](../chat-api/README.md) backend.

---

## Features

This project is 🔋 battery packed with:

- ⚡️ Next.js 15 with App Router
- ⚛️ React 19
- ✨ TypeScript
- 💨 Tailwind CSS 4 — Configured with CSS Variables to extend the **primary** color
- 💎 Pre-built Components — Components that will **automatically adapt** with your brand color
- 🃏 Jest — Configured for unit testing
- 📈 Absolute Import and Path Alias — Import components using `@/` prefix
- 📏 ESLint — Find and fix problems in your code, also will **auto sort** your imports
- 💖 Prettier — Format your code consistently
- 🐶 Husky & Lint Staged — Run scripts on your staged files before they are committed
- 🤖 Conventional Commit Lint — Make sure you & your teammates follow conventional commit
- 👷 Github Actions — Lint your code on PR
- 🔥 Snippets — A collection of useful snippets
- 🗺 Site Map — Automatically generate sitemap.xml

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [npm](https://www.npmjs.com/) >= 10
- Chat API running on port **3000** — see [chat-api](../chat-api/README.md)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) with your browser to see the result.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 5000 with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Lint code with ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

---

## Project Structure

```
chat-frontend/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # Reusable UI components
│   ├── lib/           # API clients and utilities
│   ├── styles/        # Global styles
│   └── types/         # TypeScript type declarations
├── public/            # Static assets
├── next.config.js     # Next.js configuration
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.json      # TypeScript configuration
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Chat API base URL | `http://localhost:3000` |

---

## Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). It is mandatory to use it when committing changes.

```
type(scope): subject
```

| Type | Description |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Formatting changes |
| `refactor` | Code restructure |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `build` | Build system or dependencies |
| `ci` | CI/CD configuration |
| `chore` | Maintenance tasks |
| `revert` | Revert a previous commit |

---

## Related

- [Chat API](../chat-api/README.md) — Express.js backend with MongoDB
- [Root README](../README.md) — Monorepo setup and scripts

---

*Built with ❤️ by Muhammad Zourdy*