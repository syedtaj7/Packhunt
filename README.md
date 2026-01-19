# 🎯 PackHunt - Modern Package Discovery Platform# Welcome to your Lovable project



<div align="center">## Project info



![PackHunt Banner](https://img.shields.io/badge/PackHunt-Package_Discovery-blue?style=for-the-badge)**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)## How can I edit this code?

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)There are several ways of editing your application.



**Discover the best packages across Python, Node.js, and Rust ecosystems with AI-powered semantic search - 100% FREE!****Use Lovable**



[🚀 Features](#-features) • [📋 Prerequisites](#-prerequisites) • [⚡ Quick Start](#-quick-start) • [🛠️ Development](#️-development) • [🔍 Search Modes](#-search-modes)Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.



</div>Changes made via Lovable will be committed automatically to this repo.



---**Use your preferred IDE**



## 🌟 FeaturesIf you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.



<table>The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

<tr>

<td width="50%">Follow these steps:



### 🤖 **AI-Powered Search**```sh

- **Semantic Search**: Natural language understanding using local AI# Step 1: Clone the repository using the project's Git URL.

- **Hybrid Search**: Best of both worlds (60% AI + 40% keyword)git clone <YOUR_GIT_URL>

- **Keyword Search**: Lightning-fast typo-tolerant search

- **100% FREE**: No API keys, runs locally# Step 2: Navigate to the project directory.

cd <YOUR_PROJECT_NAME>

</td>

<td width="50%"># Step 3: Install the necessary dependencies.

npm i

### 🎨 **Modern Interface**

- **Dark/Light Mode**: Beautiful UI with theme switching# Step 4: Start the development server with auto-reloading and an instant preview.

- **Responsive Design**: Works on desktop, tablet, and mobilenpm run dev

- **Real-time Filtering**: Filter by language, stars, license```

- **Smart Suggestions**: Example queries to get started

**Edit a file directly in GitHub**

</td>

</tr>- Navigate to the desired file(s).

<tr>- Click the "Edit" button (pencil icon) at the top right of the file view.

<td width="50%">- Make your changes and commit the changes.



### 📦 **Rich Package Data****Use GitHub Codespaces**

- **30+ Curated Packages**: Python, Node.js, Rust

- **Detailed Information**: Stars, downloads, docs, install commands- Navigate to the main page of your repository.

- **Category Organization**: Find packages by use case- Click on the "Code" button (green button) near the top right.

- **Star Your Favorites**: Keep track of packages you love- Select the "Codespaces" tab.

- Click on "New codespace" to launch a new Codespace environment.

</td>- Edit files directly within the Codespace and commit and push your changes once you're done.

<td width="50%">

## What technologies are used for this project?

### ⚡ **High Performance**

- **Fast API**: Express backend with rate limitingThis project is built with:

- **Vector Search**: PostgreSQL with pgvector extension

- **Caching**: React Query for optimal data fetching- Vite

- **Optimized**: < 200ms response times- TypeScript

- React

</td>- shadcn-ui

</tr>- Tailwind CSS

</table>

## How can I deploy this project?

---

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## 📋 Prerequisites

## Can I connect a custom domain to my Lovable project?

Before you begin, ensure you have the following installed:

Yes, you can!

### Required

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

| Software | Version | Download | Purpose |

|----------|---------|----------|---------|Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

| **Node.js** | 18+ | [Download](https://nodejs.org/) | JavaScript runtime |
| **Bun** | Latest | [Download](https://bun.sh/) | Fast package manager & runtime |
| **PostgreSQL** | 14+ | [Download](https://www.postgresql.org/download/) | Database (or use Supabase) |
| **Git** | Latest | [Download](https://git-scm.com/) | Version control |

### Optional (Recommended)

| Software | Version | Download | Purpose |
|----------|---------|----------|---------|
| **Meilisearch** | 1.10+ | [Download](https://github.com/meilisearch/meilisearch/releases) | Keyword search engine |
| **VS Code** | Latest | [Download](https://code.visualstudio.com/) | Code editor |

### PostgreSQL Extensions Required

```sql
-- Enable pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector;
```

> 💡 **Pro Tip**: Use [Supabase](https://supabase.com/) for a free PostgreSQL database with pgvector already enabled!

---

## ⚡ Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/syedtaj7/Packhunt.git
cd Packhunt
```

### 2️⃣ Install Dependencies

```bash
# Install frontend dependencies
bun install

# Install backend dependencies
cd server
bun install
cd ..
```

### 3️⃣ Set Up Environment Variables

#### Backend Environment (`.env` in `server/` directory)

```bash
# Navigate to server directory
cd server

# Copy example environment file
cp .env.example .env

# Edit .env file with your values
```

**Required Environment Variables:**

```env
# Database Configuration (Supabase or Local PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Meilisearch Configuration
MEILISEARCH_HOST="http://127.0.0.1:7700"
MEILISEARCH_API_KEY="your-master-key-here"

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:8080"
```

> 🔑 **Get Supabase Database URL**:
> 1. Create account at [supabase.com](https://supabase.com)
> 2. Create a new project
> 3. Go to Project Settings → Database
> 4. Copy the connection strings (both pooler and direct)
> 5. Enable pgvector extension in SQL Editor: `CREATE EXTENSION vector;`

### 4️⃣ Set Up Meilisearch (Keyword Search)

Meilisearch powers the fast, typo-tolerant keyword search.

#### Windows (PowerShell):

```powershell
# Automated setup (recommended)
.\setup-meilisearch.ps1

# Or manual download:
# 1. Download from https://github.com/meilisearch/meilisearch/releases
# 2. Place meilisearch.exe in meilisearch/ folder
# 3. Run: .\start-meilisearch.ps1
```

#### macOS/Linux:

```bash
# macOS
curl -L https://install.meilisearch.com | sh
mv meilisearch meilisearch/

# Linux
curl -L https://install.meilisearch.com | sh
mv meilisearch meilisearch/

# Start Meilisearch
cd meilisearch
./meilisearch --http-addr 127.0.0.1:7700 --master-key "your-master-key-here"
```

**Verify Meilisearch is running:**
```bash
curl http://localhost:7700/health
# Should return: {"status":"available"}
```

### 5️⃣ Initialize Database

```bash
cd server

# Generate Prisma Client
bun prisma generate

# Run database migrations
bun prisma migrate dev

# Seed the database with 30 curated packages
bun prisma db seed
```

**Expected Output:**
```
✅ Seeded 30 packages
✅ Seeded 8 categories
✅ Created category relationships
🎉 Database seeded successfully!
```

### 6️⃣ Generate AI Embeddings (Semantic Search)

This step generates vector embeddings for semantic search using a local AI model (no API keys needed!).

```bash
cd server

# Generate embeddings for all packages (~30 seconds)
bun run generate-embeddings
```

**Expected Output:**
```
🤖 Starting embedding generation...
📦 Found 30 packages without embeddings
✅ Generated embeddings for: numpy
✅ Generated embeddings for: pandas
...
🎉 Successfully generated embeddings for 30/30 packages
```

> 💡 **First Run**: The AI model (~23MB) will download automatically. Subsequent runs are instant!

### 7️⃣ Sync Data to Meilisearch

```bash
cd server

# Sync all packages to Meilisearch
bun run sync-meilisearch
```

**Expected Output:**
```
🔄 Starting Meilisearch sync...
✅ Connected to Meilisearch
📦 Found 30 packages in database
✅ Indexed 30 packages
⚙️ Updated searchable attributes
⚙️ Updated filterable attributes
⚙️ Updated sortable attributes
🎉 Sync completed successfully!
```

---

## 🚀 Running the Application

You need to run **THREE** processes simultaneously. Open three terminal windows:

### Terminal 1: Backend API Server 🔧

```bash
cd server
bun run dev
```

**Expected Output:**
```
🚀 PackHunt API Server is running!

📍 Local:    http://localhost:3001
🔗 Health:   http://localhost:3001/health
📦 Packages: http://localhost:3001/api/packages
🔍 Search:   http://localhost:3001/api/search
📂 Categories: http://localhost:3001/api/categories

Environment: development
Frontend: http://localhost:8080
```

**✅ Verify**: Open http://localhost:3001/health in browser (should show `{"status":"ok"}`)

### Terminal 2: Meilisearch Server 🔍

```bash
# Windows
.\start-meilisearch.ps1

# macOS/Linux
cd meilisearch
./meilisearch --http-addr 127.0.0.1:7700 --master-key "your-master-key-here"
```

**Expected Output:**
```
Meilisearch v1.10.3

Server is listening on: http://127.0.0.1:7700
```

**✅ Verify**: Open http://localhost:7700/health in browser (should show `{"status":"available"}`)

### Terminal 3: Frontend Development Server 🎨

```bash
bun run dev
```

**Expected Output:**
```
  VITE v5.4.21  ready in 324 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**✅ Verify**: Open http://localhost:8080 in browser

---

## 🎉 Access the Application

### 🌐 Open http://localhost:8080

You should see:
- ✅ Hero section with search bar
- ✅ Featured packages
- ✅ Language selection (Python, Node.js, Rust)
- ✅ Fully functional search

### Quick Test

1. **Search for "math"** - Should find Matplotlib, NumPy
2. **Click "Smart Search"** - Try natural language: "plotting library"
3. **Click "AI Only"** - Try: "data manipulation tool"
4. **Filter by Python** - See only Python packages
5. **Star a package** - Click star icon to save favorites

---

## 🔍 Search Modes

PackHunt offers three powerful search modes:

### 1. 🔤 **Keyword Search** (Meilisearch)
- **Best for**: Exact matches, package names, known terms
- **Features**: Typo tolerance, instant results
- **Example**: "mathplotlib" → finds "Matplotlib"
- **Speed**: ~30-60ms

### 2. 🧠 **AI Only** (Semantic Search)
- **Best for**: Natural language queries, concepts
- **Features**: Understands intent, related packages
- **Example**: "plotting library for data visualization"
- **Speed**: ~80-120ms

### 3. ⚡ **Smart Search** (Hybrid - RECOMMENDED)
- **Best for**: Everything! Best of both worlds
- **Features**: 60% AI + 40% Keyword
- **Example**: "fast web framework for APIs"
- **Speed**: ~100-200ms

**Try These Example Queries:**
```
✨ fast web framework for APIs
✨ plotting library for data visualization
✨ async HTTP client
✨ ORM for database
✨ parallel computing library
```

---

## 🛠️ Development

### Project Structure

```
PackHunt/
├── 📁 src/                      # Frontend React app
│   ├── 📁 components/           # Reusable UI components
│   │   ├── Header.tsx           # Navigation header
│   │   ├── Footer.tsx           # Page footer
│   │   ├── SearchBar.tsx        # Search input with clear
│   │   ├── PackageCard.tsx      # Package display card
│   │   ├── FilterBar.tsx        # Filter controls
│   │   └── 📁 ui/               # Shadcn UI components
│   ├── 📁 pages/                # Route pages
│   │   ├── Index.tsx            # Homepage
│   │   ├── SearchPage.tsx       # Search results
│   │   ├── PackageDetail.tsx    # Package details
│   │   ├── LanguagesPage.tsx    # Language grid
│   │   └── StarredPage.tsx      # Starred packages
│   ├── 📁 hooks/                # Custom React hooks
│   │   └── useApi.ts            # API data fetching
│   ├── 📁 lib/                  # Utility functions
│   │   ├── api.ts               # API client
│   │   └── utils.ts             # Helper functions
│   └── App.tsx                  # Main app component
│
├── 📁 server/                   # Backend Express API
│   ├── 📁 src/
│   │   ├── index.ts             # Server entry point
│   │   ├── 📁 routes/           # API routes
│   │   │   ├── packages.ts      # Package CRUD endpoints
│   │   │   ├── search.ts        # Search endpoints
│   │   │   └── categories.ts    # Category endpoints
│   │   ├── 📁 services/         # Business logic
│   │   │   ├── embeddings.ts    # AI embedding generation
│   │   │   ├── semantic-search.ts  # Vector search
│   │   │   └── meilisearch.ts   # Keyword search
│   │   ├── 📁 scripts/          # Utility scripts
│   │   │   ├── generate-embeddings.ts
│   │   │   └── sync-meilisearch.ts
│   │   └── 📁 lib/
│   │       └── prisma.ts        # Database client
│   ├── 📁 prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.ts              # Seed data (30 packages)
│   │   └── 📁 migrations/       # Database migrations
│   ├── .env.example             # Environment template
│   └── package.json
│
├── 📁 meilisearch/              # Meilisearch data
│   ├── meilisearch.exe          # (Download separately)
│   └── 📁 data/                 # Search index data (gitignored)
│
├── setup-meilisearch.ps1        # Meilisearch setup script
├── start-meilisearch.ps1        # Start Meilisearch
├── MEILISEARCH-SETUP.md         # Meilisearch docs
├── package.json
└── README.md
```

### Available Scripts

#### Frontend Scripts

```bash
bun run dev          # Start development server (localhost:8080)
bun run build        # Build for production
bun run preview      # Preview production build
bun run lint         # Run ESLint
```

#### Backend Scripts

```bash
cd server

# Development
bun run dev                    # Start dev server with nodemon (localhost:3001)
bun run build                  # Build TypeScript to JavaScript
bun run start                  # Start production server

# Database Management
bun prisma generate            # Generate Prisma Client
bun prisma migrate dev         # Create & run new migration
bun prisma migrate deploy      # Deploy migrations (production)
bun prisma db seed             # Seed database with packages
bun prisma studio              # Open Prisma Studio GUI
bun prisma db push             # Push schema without migration

# Data Utilities
bun run generate-embeddings    # Generate AI embeddings for all packages
bun run sync-meilisearch       # Sync packages to Meilisearch index
```

### API Endpoints

#### Health Check

```http
GET /health                    # Server health check
```

#### Packages

```http
GET /api/packages              # List all packages
  ?language=PYTHON             # Filter by language
  &minStars=1000               # Minimum stars
  &license=MIT                 # Filter by license
  &sortBy=stars                # Sort by: stars, downloads, recent, name
  &limit=50                    # Results per page
  &page=1                      # Page number

GET /api/packages/:slug        # Get package by slug
GET /api/packages/:slug/stats  # Get package statistics
GET /api/packages/trending     # Get trending packages
```

#### Search

```http
GET /api/search/meilisearch    # Keyword search (typo-tolerant)
GET /api/search/semantic       # AI semantic search
GET /api/search/hybrid         # Hybrid search (RECOMMENDED)

Query Parameters:
  ?q=query                     # Search query (required)
  &language=PYTHON             # Filter by language
  &minStars=1000               # Minimum stars
  &license=MIT                 # Filter by license
  &sortBy=stars                # Sort by: relevance, stars, downloads, recent, name
  &limit=20                    # Results per page (default: 20)
  &page=1                      # Page number (default: 1)
```

**Example Requests:**

```bash
# Keyword search
curl "http://localhost:3001/api/search/meilisearch?q=math"

# Semantic search (natural language)
curl "http://localhost:3001/api/search/semantic?q=plotting+library"

# Hybrid search with filters
curl "http://localhost:3001/api/search/hybrid?q=web+framework&language=PYTHON&minStars=10000"
```

#### Categories

```http
GET /api/categories            # List all categories
GET /api/categories/:name/packages  # Get packages in category
```

### Environment Variables Reference

#### Backend (`server/.env`)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection (pooler) | `postgresql://...?pgbouncer=true` | ✅ Yes |
| `DIRECT_URL` | PostgreSQL direct connection | `postgresql://...` | ✅ Yes |
| `MEILISEARCH_HOST` | Meilisearch server URL | `http://127.0.0.1:7700` | ✅ Yes |
| `MEILISEARCH_API_KEY` | Meilisearch master key | `your-master-key-here` | ✅ Yes |
| `PORT` | Backend server port | `3001` | ❌ No (default: 3001) |
| `NODE_ENV` | Environment mode | `development` or `production` | ❌ No |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:8080` | ❌ No |

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### ❌ Problem: "Failed to fetch" Error

**Symptoms**: Frontend shows error alert, can't load packages

**Solution**:
```bash
# 1. Check if backend is running
curl http://localhost:3001/health
# Should return: {"status":"ok"}

# 2. If not running, start backend
cd server
bun run dev

# 3. Check for port conflicts
netstat -ano | findstr :3001

# 4. Verify CORS settings in server/src/index.ts
```

#### ❌ Problem: "Meilisearch connection failed"

**Symptoms**: Keyword search doesn't work, 500 errors

**Solution**:
```bash
# 1. Check if Meilisearch is running
curl http://localhost:7700/health

# 2. Start Meilisearch
.\start-meilisearch.ps1  # Windows
cd meilisearch && ./meilisearch --http-addr 127.0.0.1:7700  # macOS/Linux

# 3. Re-sync data
cd server
bun run sync-meilisearch
```

#### ❌ Problem: "Database connection error"

**Symptoms**: `P1001: Can't reach database server`, backend won't start

**Solution**:
```bash
# 1. Check .env file exists
cd server
cat .env  # Should show DATABASE_URL and DIRECT_URL

# 2. Test connection
bun prisma db pull

# 3. Verify pgvector extension
# In Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS vector;

# 4. Check firewall/network
ping your-database-host
```

#### ❌ Problem: "No packages found"

**Symptoms**: Empty search results, no packages on homepage

**Solution**:
```bash
# 1. Seed database
cd server
bun prisma db seed

# 2. Generate embeddings
bun run generate-embeddings

# 3. Sync to Meilisearch
bun run sync-meilisearch

# 4. Verify data
bun prisma studio
# Check if packages exist in database
```

#### ❌ Problem: Port Already in Use

**Symptoms**: `EADDRINUSE: address already in use :::3001` or `:8080`

**Solution**:
```bash
# Windows - Kill process on port
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# macOS/Linux - Kill process on port
lsof -ti:3001 | xargs kill -9

# Or change port in config
# Backend: server/.env → PORT=3002
# Frontend: vite.config.ts → server: { port: 8081 }
```

#### ❌ Problem: "Cannot read properties of undefined (reading 'toString')"

**Symptoms**: React error, blank screen, console errors

**Solution**: Already fixed! Update your code:
```bash
git pull origin main
```

The `formatNumber` function in `PackageCard.tsx` now handles undefined values.

#### ❌ Problem: Embeddings generation is slow

**Symptoms**: `generate-embeddings` takes too long

**Solution**:
```bash
# This is normal for first run!
# The AI model (~23MB) downloads automatically
# Subsequent runs are much faster

# If stuck, check:
# 1. Internet connection (for model download)
# 2. Disk space (need ~50MB)
# 3. Kill and restart
```

#### ❌ Problem: Search results are empty

**Symptoms**: Search works but returns no results

**Solution**:
```bash
# 1. Check search mode
# - Keyword: Requires Meilisearch running
# - Semantic: Requires embeddings generated
# - Hybrid: Requires both

# 2. Verify embeddings exist
cd server
bun prisma studio
# Check Package table → embeddingGeneratedAt should have dates

# 3. Check Meilisearch index
curl "http://localhost:7700/indexes/packages/stats"
# Should show numberOfDocuments > 0
```

---

## 📚 Technology Stack

### Frontend

- **Framework**: [React 18](https://reactjs.org/) with TypeScript
- **Build Tool**: [Vite 5](https://vitejs.dev/) - Ultra-fast HMR
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) - Beautiful components
- **Routing**: [React Router v6](https://reactrouter.com/) - Client-side routing
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) - Async state management
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful icons
- **State Management**: React Context + Local Storage

### Backend

- **Runtime**: [Bun](https://bun.sh/) / Node.js - Fast JavaScript runtime
- **Framework**: [Express](https://expressjs.com/) - Web framework
- **Language**: TypeScript - Type-safe JavaScript
- **ORM**: [Prisma](https://www.prisma.io/) - Next-gen database toolkit
- **Database**: PostgreSQL 14+ - Relational database
- **Vector Extension**: [pgvector](https://github.com/pgvector/pgvector) - Vector similarity search
- **Search Engine**: [Meilisearch](https://www.meilisearch.com/) - Fast search API
- **AI/ML**: [Transformers.js](https://huggingface.co/docs/transformers.js) - Run transformers in Node
- **Embedding Model**: `Xenova/all-MiniLM-L6-v2` (384 dimensions)

### Infrastructure & Tools

- **Package Manager**: Bun - All-in-one toolkit
- **Development**: Nodemon - Auto-reload on changes
- **API Testing**: cURL, Postman compatible
- **Database GUI**: Prisma Studio - Built-in database browser
- **Rate Limiting**: express-rate-limit (1000 req/15min)
- **CORS**: Configured for localhost development
- **Caching**: React Query (2-minute stale time)

### Search Technology

- **Keyword Search**: Meilisearch with typo tolerance
- **Semantic Search**: Cosine similarity with pgvector
- **Hybrid Search**: 60% semantic + 40% keyword (weighted combination)
- **Vector Dimensions**: 384 (MiniLM-L6-v2 model)
- **Similarity Metric**: Cosine distance (`<=>` operator)

---

## 🚀 Deployment

### Prerequisites for Production

- PostgreSQL database with pgvector extension
- Meilisearch Cloud or self-hosted instance
- Node.js 18+ environment

### Deploy Backend API

#### Option 1: Railway (Recommended)

1. Create account at [railway.app](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Configure:
   ```
   Root Directory: server
   Build Command: bun install && bun prisma generate
   Start Command: bun run start
   ```
5. Add environment variables (all from `.env`)
6. Deploy!

#### Option 2: Render

1. Create account at [render.com](https://render.com/)
2. Click "New" → "Web Service"
3. Connect GitHub repository
4. Configure:
   ```
   Root Directory: server
   Build Command: bun install && bun prisma generate && bun prisma migrate deploy
   Start Command: bun run start
   ```
5. Add environment variables
6. Deploy!

#### Post-Deployment Steps

```bash
# 1. Run migrations
railway run bun prisma migrate deploy  # Railway
# or
render run bun prisma migrate deploy   # Render

# 2. Seed database
railway run bun prisma db seed

# 3. Generate embeddings
railway run bun run generate-embeddings

# 4. Sync to Meilisearch
railway run bun run sync-meilisearch
```

### Deploy Frontend

#### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run in project root:
   ```bash
   vercel
   ```
3. Follow prompts
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
5. Deploy: `vercel --prod`

#### Netlify

1. Create account at [netlify.com](https://www.netlify.com/)
2. Click "Add new site" → "Import from Git"
3. Select repository
4. Configure:
   ```
   Build command: bun run build
   Publish directory: dist
   ```
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
6. Deploy!

### Meilisearch Cloud

1. Create account at [meilisearch.com](https://www.meilisearch.com/cloud)
2. Create a new project
3. Copy API URL and key
4. Update backend `.env`:
   ```env
   MEILISEARCH_HOST=https://your-project.meilisearch.io
   MEILISEARCH_API_KEY=your-api-key
   ```
5. Run sync: `bun run sync-meilisearch`

---

## 📖 Additional Documentation

- **Meilisearch Setup**: [MEILISEARCH-SETUP.md](./MEILISEARCH-SETUP.md)
- **Database Schema**: [server/prisma/schema.prisma](./server/prisma/schema.prisma)
- **API Routes**: [server/src/routes/](./server/src/routes/)
- **Seed Data**: [server/prisma/seed.ts](./server/prisma/seed.ts)

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Development Guidelines

- Write TypeScript with proper types
- Follow existing code style
- Add comments for complex logic
- Test your changes locally
- Update documentation if needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) - Beautiful component library
- **AI Model**: [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) - Sentence transformers
- **Search Engine**: [Meilisearch](https://www.meilisearch.com/) - Fast search API
- **Icons**: [Lucide](https://lucide.dev/) - Beautiful & consistent icons
- **Database**: [Supabase](https://supabase.com/) - PostgreSQL with pgvector
- **Inspiration**: npm, PyPI, crates.io package registries

---

## 📬 Contact & Support

- **GitHub**: [@syedtaj7](https://github.com/syedtaj7)
- **Repository**: [PackHunt](https://github.com/syedtaj7/Packhunt)
- **Issues**: [Report a bug](https://github.com/syedtaj7/Packhunt/issues)

---

<div align="center">

### 🎯 Project Checklist - "Is My Project Running?"

Use this checklist to verify everything is working:

- [ ] ✅ Backend server running on http://localhost:3001
- [ ] ✅ Meilisearch running on http://localhost:7700
- [ ] ✅ Frontend running on http://localhost:8080
- [ ] ✅ Database seeded with 30 packages
- [ ] ✅ Embeddings generated for all packages
- [ ] ✅ Meilisearch synced with package data
- [ ] ✅ Health check returns `{"status":"ok"}`
- [ ] ✅ Search works in all three modes
- [ ] ✅ Packages display correctly
- [ ] ✅ Filters work (language, stars, license)

**All checked?** 🎉 **You're ready to go!**

---

**Made with ❤️ by Syed Taj**

⭐ **Star this repo** if you find it helpful!

[Report Bug](https://github.com/syedtaj7/Packhunt/issues) • [Request Feature](https://github.com/syedtaj7/Packhunt/issues)

</div>
