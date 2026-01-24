
 Package Compass

A modern package discovery platform for Python, JavaScript, and Rust ecosystems.

## Project Structure

This project is organized into two main directories:

```
package-compass/
├── frontend/          # React + Vite frontend application
│   ├── src/          # Frontend source code
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
├── backend/          # Express.js backend API
│   ├── src/          # Backend source code
│   ├── prisma/       # Database schema and migrations
│   ├── meilisearch/  # Search engine data
│   └── package.json  # Backend dependencies
├── package.json      # Root package.json with convenience scripts
└── README.md         # This file
```

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL database
- Meilisearch (optional, for search functionality)

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```
   This will install dependencies for both frontend and backend.

2. **Set up environment variables:**

   **Frontend** (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

   **Backend** (`backend/.env`):
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/packhunt
   DIRECT_URL=postgresql://user:password@localhost:5432/packhunt
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:8080
   MEILI_HTTP_ADDR=127.0.0.1:7700
   MEILI_MASTER_KEY=your-master-key
   ```

3. **Set up the database:**
   ```bash
   npm run prisma:migrate
   npm run backend:seed
   ```

### Running the Application

#### Run Both Frontend and Backend Together
```bash
npm run dev
```
This will start both servers concurrently:
- Frontend: http://localhost:8080
- Backend: http://localhost:3001

#### Run Frontend Only
```bash
npm run dev:frontend
# or
cd frontend
npm run dev
```

#### Run Backend Only
```bash
npm run dev:backend
# or
cd backend
npm run dev
```

## Available Scripts

### Root Level Scripts

- `npm run dev` - Run both frontend and backend in development mode
- `npm run install:all` - Install dependencies for both projects
- `npm run dev:frontend` - Run only the frontend
- `npm run dev:backend` - Run only the backend
- `npm run build:frontend` - Build the frontend for production
- `npm run build:backend` - Build the backend for production
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:migrate` - Run database migrations
- `npm run backend:seed` - Seed the database
- `npm run backend:import` - Import packages
- `npm run backend:discover` - Auto-discover packages

### Frontend Scripts (in `frontend/` directory)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend Scripts (in `backend/` directory)

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Run built JavaScript
- `npm run seed` - Seed database with initial data
- `npm run import` - Import packages from data sources
- `npm run discover` - Auto-discover new packages
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run meilisearch:sync` - Sync data with Meilisearch
- `npm run embeddings:generate` - Generate embeddings for semantic search

## Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- React Router
- TanStack Query
- Firebase Authentication

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Meilisearch
- JWT Authentication

## Development

### Frontend Development

The frontend is a modern React application built with Vite. It features:
- Hot Module Replacement (HMR)
- TypeScript support
- TailwindCSS for styling
- Shadcn/ui component library
- React Router for routing
- TanStack Query for data fetching

### Backend Development

The backend is a RESTful API built with Express.js. It features:
- TypeScript support
- Prisma ORM for database access
- Meilisearch integration for full-text search
- Rate limiting and security middleware
- CORS configuration

## Database

The project uses PostgreSQL with Prisma ORM. To manage the database:

1. **Create a migration:**
   ```bash
   cd backend
   npx prisma migrate dev --name your_migration_name
   ```

2. **Generate Prisma Client:**
   ```bash
   cd backend
   npx prisma generate
   ```

3. **Open Prisma Studio:**
   ```bash
   npm run prisma:studio
   ```

## Deployment

### Frontend Deployment

Build the frontend:
```bash
npm run build:frontend
```

The built files will be in `frontend/dist/`. Deploy this directory to your hosting provider (Vercel, Netlify, etc.).

### Backend Deployment

Build the backend:
```bash
npm run build:backend
```

The built files will be in `backend/dist/`. Deploy to your server or platform (Railway, Heroku, etc.).

## Troubleshooting

### Port Already in Use

If ports 8080 (frontend) or 3001 (backend) are already in use:
- Change the frontend port in `frontend/vite.config.ts`
- Change the backend port in `backend/.env` or `backend/src/index.ts`

### Database Connection Issues

Ensure PostgreSQL is running and the `DATABASE_URL` in `backend/.env` is correct.

### Meilisearch Issues

If search functionality isn't working:
1. Ensure Meilisearch is running
2. Check `MEILI_HTTP_ADDR` in `backend/.env`
3. Run `npm run meilisearch:sync` to sync data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

MIT
