# Package Compass

A modern package discovery platform for Python, JavaScript, and Rust ecosystems with AI-powered semantic search.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** database (for storing package data)
- **Meilisearch** (optional, for enhanced search functionality)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd package-compass
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```
   This command installs dependencies for both frontend and backend in one go.

3. **Set up environment variables:**

   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

   Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/packhunt
   DIRECT_URL=postgresql://user:password@localhost:5432/packhunt
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:8080
   MEILI_HTTP_ADDR=127.0.0.1:7700
   MEILI_MASTER_KEY=your-master-key
   ```

4. **Set up the database:**
   ```bash
   # Run database migrations
   npm run prisma:migrate
   
   # Seed the database with initial data
   npm run backend:seed
   ```

### Running the Application

**Option 1: Run everything at once (Recommended)**
```bash
npm run dev
```
This starts both frontend and backend servers concurrently:
- 🎨 **Frontend**: http://localhost:8080
- ⚙️ **Backend API**: http://localhost:3001
- 📊 **API Health**: http://localhost:3001/health

**Option 2: Run frontend only**
```bash
npm run dev:frontend
# or navigate to frontend folder
cd frontend && npm run dev
```

**Option 3: Run backend only**
```bash
npm run dev:backend
# or navigate to backend folder
cd backend && npm run dev
```

## 📁 Project Structure

This project is organized into separate frontend and backend folders for better maintainability:

```
package-compass/
├── frontend/              # React + Vite frontend application
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and API client
│   │   └── contexts/     # React contexts
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   └── vite.config.ts    # Vite configuration
│
├── backend/              # Express.js backend API
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic
│   │   ├── scripts/      # Data management scripts
│   │   └── lib/          # Utilities
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── migrations/   # Database migrations
│   ├── meilisearch/      # Search engine data
│   ├── package.json      # Backend dependencies
│   └── tsconfig.json     # TypeScript configuration
│
├── package.json          # Root package with convenience scripts
├── README.md             # This file
└── QUICKSTART.md         # Quick reference guide
```

## 📜 Available Scripts

### Root Level Scripts (Run from project root)

| Command | Description |
|---------|-------------|
| `npm run dev` | 🚀 Run both frontend and backend together |
| `npm run install:all` | 📦 Install dependencies for both projects |
| `npm run dev:frontend` | 🎨 Run only the frontend |
| `npm run dev:backend` | ⚙️ Run only the backend |
| `npm run start:frontend` | Start frontend production server |
| `npm run start:backend` | Start backend production server |
| `npm run build:frontend` | 🔨 Build frontend for production |
| `npm run build:backend` | 🔨 Build backend for production |
| `npm run lint:frontend` | 🔍 Run ESLint on frontend |
| `npm run prisma:studio` | 🗄️ Open Prisma Studio (database GUI) |
| `npm run prisma:migrate` | 📊 Run database migrations |
| `npm run backend:seed` | 🌱 Seed database with initial data |
| `npm run backend:import` | 📥 Import packages from data sources |
| `npm run backend:discover` | 🔎 Auto-discover new packages |

### Frontend Scripts (Run from `frontend/` directory)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

### Backend Scripts (Run from `backend/` directory)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run start` | Start production server |
| `npm run build` | Build TypeScript to JavaScript |
| `npm run seed` | Seed database with sample data |
| `npm run import` | Import packages from registries |
| `npm run discover` | Auto-discover new trending packages |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run meilisearch:sync` | Sync data with Meilisearch |
| `npm run embeddings:generate` | Generate AI embeddings for semantic search |

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool with HMR
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library
- **React Router** - Client-side routing
- **TanStack Query** - Powerful data fetching and caching
- **Firebase Authentication** - User authentication
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe server code
- **Prisma ORM** - Modern database toolkit
- **PostgreSQL** - Relational database
- **Meilisearch** - Lightning-fast search engine
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting

## 🔧 Development

### Frontend Development

The frontend is a modern React SPA (Single Page Application) with:
- **Hot Module Replacement (HMR)** - Instant updates without refresh
- **TypeScript** - Full type safety
- **TailwindCSS** - Rapid UI development
- **Component Library** - Pre-built, customizable components
- **Smart Routing** - Fast client-side navigation
- **Optimized Data Fetching** - Automatic caching and background updates

### Backend Development

The backend is a RESTful API with:
- **TypeScript** - Type-safe server code
- **Prisma ORM** - Type-safe database queries
- **Meilisearch Integration** - Full-text and semantic search
- **Security** - Helmet, CORS, rate limiting
- **Hot Reload** - Automatic restart on code changes
- **Database Migrations** - Version-controlled schema changes

### API Endpoints

**Packages**
- `GET /api/packages` - List all packages with filters
- `GET /api/packages/:slug` - Get package details
- `GET /api/packages/:slug/alternatives` - Get similar packages

**Search**
- `GET /api/search` - Keyword search
- `GET /api/search/semantic` - AI-powered semantic search
- `GET /api/search/hybrid` - Best of both worlds

**Categories**
- `GET /api/categories` - List all categories
- `GET /api/categories/:slug/packages` - Get packages in category

**Health**
- `GET /health` - Server health check

## 🗄️ Database Management

The project uses PostgreSQL with Prisma ORM for type-safe database access.

### Common Database Tasks

**Create a new migration:**
```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

**Generate Prisma Client (after schema changes):**
```bash
cd backend
npx prisma generate
```

**Open Prisma Studio (visual database editor):**
```bash
npm run prisma:studio
# or from backend folder
npx prisma studio
```

**Reset database (⚠️ development only):**
```bash
cd backend
npx prisma migrate reset
```

**View database schema:**
```bash
cd backend
npx prisma db pull
```

## 🚀 Deployment

### Frontend Deployment (Vercel, Netlify, etc.)

1. **Build the frontend:**
   ```bash
   npm run build:frontend
   ```

2. **Deploy the `frontend/dist/` directory** to your hosting provider

3. **Set environment variables** on your hosting platform:
   - `VITE_API_URL` - Your backend API URL
   - Firebase configuration variables

### Backend Deployment (Railway, Heroku, Render, etc.)

1. **Build the backend:**
   ```bash
   npm run build:backend
   ```

2. **Deploy the backend directory** to your hosting platform

3. **Set environment variables:**
   - `DATABASE_URL` - PostgreSQL connection string
   - `DIRECT_URL` - Direct database connection (for migrations)
   - `PORT` - Server port (usually provided by platform)
   - `NODE_ENV=production`
   - `FRONTEND_URL` - Your frontend URL for CORS
   - Meilisearch configuration

4. **Run migrations:**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

## 🐛 Troubleshooting

### Port Already in Use

**Frontend (port 8080):**
- Change port in `frontend/vite.config.ts`:
  ```typescript
  server: { port: 8081 }
  ```

**Backend (port 3001):**
- Change `PORT` in `backend/.env`
- Or modify `backend/src/index.ts`

### Database Connection Issues

1. Ensure PostgreSQL is running:
   ```bash
   # On Windows
   Get-Service postgresql*
   
   # On Mac/Linux
   sudo service postgresql status
   ```

2. Verify `DATABASE_URL` in `backend/.env` is correct

3. Test connection:
   ```bash
   cd backend
   npx prisma db pull
   ```

### Meilisearch Not Working

1. Check if Meilisearch is running:
   ```bash
   curl http://localhost:7700/health
   ```

2. Verify `MEILI_HTTP_ADDR` in `backend/.env`

3. Sync data to Meilisearch:
   ```bash
   npm run meilisearch:sync
   ```

### Frontend Can't Connect to Backend

1. Verify backend is running on port 3001
2. Check `VITE_API_URL` in `frontend/.env`
3. Check CORS settings in `backend/src/index.ts`
4. Open browser console (F12) to see network errors

### Dependencies Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove all node_modules
rm -rf node_modules frontend/node_modules backend/node_modules

# Reinstall
npm run install:all
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test both frontend and backend thoroughly
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- Write TypeScript with proper types
- Follow existing code style
- Add comments for complex logic
- Test your changes locally
- Update documentation if needed

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health
- **Prisma Studio**: http://localhost:5555 (when running)

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Happy Coding! 🎉**
