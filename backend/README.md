# Package Compass - Backend

Express.js backend API for the Package Compass platform.

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in this directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/packhunt
DIRECT_URL=postgresql://user:password@localhost:5432/packhunt
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
MEILI_HTTP_ADDR=127.0.0.1:7700
MEILI_MASTER_KEY=your-master-key
```

### Database Setup

1. **Run migrations:**
   ```bash
   npm run prisma:migrate
   ```

2. **Seed the database:**
   ```bash
   npm run seed
   ```

### Development

```bash
npm run dev
```

The API will be available at http://localhost:3001

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── lib/            # Shared utilities and configurations
│   ├── routes/         # API route handlers
│   ├── scripts/        # Data management scripts
│   ├── services/       # Business logic services
│   └── index.ts        # Entry point
├── prisma/
│   ├── schema.prisma   # Database schema
│   ├── seed.ts         # Database seeding script
│   └── migrations/     # Database migrations
└── meilisearch/        # Search engine data
```

## Technology Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Meilisearch
- Helmet (Security)
- CORS
- Express Rate Limit

## API Endpoints

### Packages
- `GET /api/packages` - List all packages
- `GET /api/packages/:slug` - Get package details
- `GET /api/packages/:slug/alternatives` - Get package alternatives

### Search
- `GET /api/search` - Search packages
- `GET /api/search/semantic` - Semantic search

### Categories
- `GET /api/categories` - List all categories

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm start` - Start development server (alias for dev)
- `npm run build` - Build TypeScript to JavaScript
- `npm run seed` - Seed database with initial data
- `npm run import` - Import packages from data sources
- `npm run discover` - Auto-discover new packages
- `npm run import-discovered` - Import discovered packages
- `npm run auto-update` - Run full update cycle
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run meilisearch:sync` - Sync data with Meilisearch
- `npm run embeddings:generate` - Generate embeddings for semantic search

## Database Management

### Create a Migration

```bash
npx prisma migrate dev --name your_migration_name
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Open Prisma Studio

```bash
npm run prisma:studio
```

## Data Management

### Import Packages

```bash
npm run import
```

### Auto-discover Packages

```bash
npm run discover
```

### Full Update Cycle

```bash
npm run auto-update
```

This will:
1. Discover new packages
2. Import discovered packages
3. Sync with Meilisearch
4. Generate embeddings for semantic search
