# PackHunt Backend Server

Backend API for PackHunt - A searchable directory of programming packages across multiple languages.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Supabase account (free tier)
- npm or bun package manager

### Setup (First Time)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Follow `SUPABASE_SETUP.md` to get your database URL
   - Add the connection string to `.env`

3. **Set up database:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Seed initial data:**
   ```bash
   npm run seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

Server will be running at: http://localhost:3001

## 📁 Project Structure

```
server/
├── src/
│   ├── index.ts              # Main Express server
│   ├── routes/
│   │   ├── packages.ts       # Package CRUD operations
│   │   ├── search.ts         # Search functionality
│   │   └── categories.ts     # Category management
│   └── lib/
│       ├── prisma.ts         # Database client
│       ├── meilisearch.ts    # Search engine integration
│       └── embeddings.ts     # OpenAI embeddings for semantic search
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data
├── .env                      # Environment variables (not in git)
└── package.json              # Dependencies
```

## 🛠️ Available Scripts

```bash
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm run start            # Start production server
npm run seed             # Seed database with sample packages
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (DB GUI)
```

## 🔌 API Endpoints

### Packages
- `GET /api/packages` - List all packages
- `GET /api/packages/:slug` - Get single package details
- Query params: `?language=python&limit=20&offset=0`

### Search
- `GET /api/search?q=numpy` - Search packages
- Query params: `?q=query&language=python&minStars=1000&license=MIT`
- `POST /api/search/semantic` - AI-powered semantic search

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:slug/packages` - Get packages in category

### Health
- `GET /health` - Server health check

## 🗄️ Database Schema

See `prisma/schema.prisma` for full schema. Main tables:

- **Package** - Package metadata, stars, description
- **Category** - Package categories (Data Science, Web Frameworks, etc.)
- **Example** - Code examples for each package
- **Alternative** - Related/alternative packages
- **Dependency** - Package dependencies

## 🔧 Configuration

Environment variables (`.env`):

```env
# Required
DATABASE_URL=          # Supabase connection string
PORT=3001             # Server port
FRONTEND_URL=         # CORS allowed origin

# Optional (for advanced features)
GITHUB_TOKEN=         # GitHub API token
MEILISEARCH_HOST=     # Meilisearch instance
MEILISEARCH_KEY=      # Meilisearch API key
OPENAI_API_KEY=       # OpenAI for semantic search
```

## 📚 Tech Stack

- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Search:** Meilisearch + pgvector
- **AI:** OpenAI Embeddings (text-embedding-3-small)

## 🐛 Troubleshooting

### Database connection failed
- Verify `DATABASE_URL` in `.env` is correct
- Check Supabase project is running
- Ensure password is correct in connection string

### Prisma client errors
```bash
npm run prisma:generate
```

### Migration errors
```bash
npm run prisma:migrate
```

### Port already in use
Change `PORT` in `.env` or kill process using port 3001

## 📖 Documentation

- `SUPABASE_SETUP.md` - Database setup guide
- `PROGRESS.md` - Implementation progress tracker
- `QUICK_REFERENCE.md` - Architecture overview

## 🤝 Contributing

This is part of the PackHunt project. See main README for contribution guidelines.

## 📄 License

MIT
