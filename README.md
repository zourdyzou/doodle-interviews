# Doodle Frontend Challenge

A full-stack monorepo for the Doodle frontend challenge, consisting of a **Chat API** backend and a **Next.js** frontend.

---

## Author

**Muhammad Zourdy**

---

## Project Structure

```
doodle-interviews/
├── chat-api/          # Express.js REST API with MongoDB
├── chat-frontend/     # Next.js 15 frontend with Tailwind CSS
├── package.json       # Root monorepo scripts
└── README.md
```

---

## Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) >= 22
- [npm](https://www.npmjs.com/) >= 10
- [pnpm](https://pnpm.io/) >= 9
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [WSL2](https://learn.microsoft.com/en-us/windows/wsl/) (Windows only)

### System Requirements

- At least 4GB of RAM
- Ports **3000**, **5000**, and **27017** must be available
- Internet connection for pulling Docker images

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/doodle-interviews.git
cd doodle-interviews
```

### 2. Install all dependencies

```bash
npm run install:all
```

### 3. Set up environment variables

For the API, create a `.env` file inside `chat-api/`:

```bash
cp chat-api/.env.example chat-api/.env
```

For the frontend, create a `.env.local` file inside `chat-frontend/`:

```bash
cp chat-frontend/.env.example chat-frontend/.env.local
```

---

## Running the Project

### Run everything at once (recommended)

This starts both the backend (with Docker) and the frontend simultaneously:

```bash
npm run dev
```

### Run individually

```bash
# Start only the API (with Docker)
npm run dev:api

# Start only the frontend
npm run dev:frontend
```

---

## Chat API (`chat-api/`)

An Express.js REST API with MongoDB, written in TypeScript.

### Tech Stack

- **Runtime**: Node.js >= 22
- **Framework**: Express.js 4
- **Database**: MongoDB 8 (via Docker)
- **ODM**: Mongoose
- **Language**: TypeScript 5
- **Validation**: Zod
- **Documentation**: Swagger UI

### Running the API

#### With Docker (recommended)

```bash
# Start API and MongoDB
npm run docker:up

# Start API with hot reload
npm run dev:api

# Stop Docker services
npm run docker:down

# Clean up including volumes
npm run docker:clean
```

#### Without Docker (local MongoDB required)

```bash
cd chat-api
npm install
npm run dev
```

### API Scripts

| Command | Description |
|---|---|
| `npm run dev:api` | Start API with hot reload |
| `npm run build:api` | Build API for production |
| `npm run lint:api` | Lint API code |
| `npm run lint:fix:api` | Auto-fix lint issues |
| `npm run format:api` | Format API code with Prettier |
| `npm run docker:up` | Start Docker services |
| `npm run docker:down` | Stop Docker services |
| `npm run docker:clean` | Stop and remove volumes |

### API Ports

| Service | Port |
|---|---|
| Express API | 3000 |
| MongoDB | 27017 |

---

## Chat Frontend (`chat-frontend/`)

A Next.js 15 frontend with Tailwind CSS, written in TypeScript.

### Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Package Manager**: pnpm
- **Testing**: Jest + Testing Library
- **Linting**: ESLint + Prettier
- **Validation**: Zod

### Running the Frontend

```bash
cd chat-frontend
pnpm install
pnpm dev        # runs on port 5000
pnpm build      # production build
pnpm start      # start production server
```

### Frontend Scripts

| Command | Description |
|---|---|
| `npm run dev:frontend` | Start frontend dev server on port 5000 |
| `npm run build:frontend` | Build frontend for production |
| `npm run lint:frontend` | Lint frontend code |
| `npm run lint:fix:frontend` | Auto-fix lint issues |
| `npm run format:frontend` | Format code with Prettier |
| `npm run test:frontend` | Run frontend tests |

### Frontend Port

| Service | Port |
|---|---|
| Next.js Dev Server | 5000 |

---

## Root Scripts Reference

All commands are run from the **root** of the monorepo:

| Command | Description |
|---|---|
| `npm run dev` | Run frontend + backend concurrently |
| `npm run dev:api` | Run backend only |
| `npm run dev:frontend` | Run frontend only |
| `npm run build` | Build both projects |
| `npm run build:api` | Build API only |
| `npm run build:frontend` | Build frontend only |
| `npm run install:all` | Install deps for both projects |
| `npm run lint` | Lint both projects |
| `npm run lint:fix` | Auto-fix lint in both projects |
| `npm run format` | Format both projects |
| `npm run test` | Run tests for both projects |
| `npm run docker:up` | Start Docker services |
| `npm run docker:down` | Stop Docker services |
| `npm run docker:clean` | Stop Docker and remove volumes |
| `npm run clean` | Remove node_modules and build artifacts |

---

## Docker Services

The API uses Docker Compose to run MongoDB. The `docker-compose.yml` is located in `chat-api/`.

```bash
# Start services in detached mode
docker compose up -d

# View running containers
docker ps

# View logs
docker compose logs

# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v
```

---

## Environment Variables

### API (`chat-api/.env`)

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/doodle-chat
```

### Frontend (`chat-frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## License

PROPRIETARY — Doodle AG

---

*Built with ❤️ by Muhammad Zourdy*
