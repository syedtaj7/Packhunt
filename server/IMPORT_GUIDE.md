# 🚀 Automated Package Import Guide

This guide shows you how to automatically import packages into your database using the GitHub API and package registry APIs.

## 📋 How It Works

The import script automatically:
1. ✅ Fetches repository data from GitHub (stars, forks, description, license)
2. ✅ Fetches package data from registries (downloads, latest version, docs URL)
3. ✅ Creates packages in your database with all metadata
4. ✅ Links packages to categories
5. ✅ Auto-detects GitHub repo if not provided

## 🔧 Setup

### 1. Get a GitHub Token (Recommended)

Without a token, you're limited to **60 API requests per hour**. With a token: **5,000 requests per hour**.

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name like "PackHunt Import"
4. Select scopes: `public_repo` (or just leave default)
5. Click "Generate token"
6. Copy the token

### 2. Set Environment Variable

**Windows PowerShell:**
```powershell
$env:GITHUB_TOKEN="your_token_here"
```

**Linux/Mac:**
```bash
export GITHUB_TOKEN="your_token_here"
```

**Or add to `.env` file:**
```env
GITHUB_TOKEN=your_token_here
```

## 🎯 Usage

### Quick Start - Import Pre-configured Packages

The script comes with 25 popular packages ready to import:

```bash
cd server
npm run import
```

This will import:
- **Python**: TensorFlow, PyTorch, Flask, Pillow, OpenCV, BeautifulSoup, Scrapy, Streamlit, Plotly, Black
- **Node.js**: Vue, Svelte, NestJS, Webpack, Vite, ESLint, Prettier, Mongoose, GraphQL, Zod
- **Rust**: anyhow, thiserror, tracing, async-trait, hyper

### Add More Packages

Edit `server/src/scripts/import-packages.ts` and add to the `packagesToImport` array:

```typescript
const packagesToImport: PackageInput[] = [
  // Add your packages here
  { 
    name: 'package-name', 
    language: 'python', // or 'nodejs', 'rust'
    ecosystem: 'pypi',  // or 'npm', 'crates.io'
    categories: ['Data Science', 'Machine Learning'],
    githubRepo: 'owner/repo' // Optional - will auto-detect if not provided
  },
  
  // More examples:
  { name: 'keras', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'] },
  { name: 'tailwindcss', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'] },
  { name: 'polars', language: 'rust', ecosystem: 'crates.io', categories: ['Data Science'] },
];
```

Then run:
```bash
npm run import
```

## 📊 What Gets Imported

For each package, the script fetches:

### From GitHub API:
- ⭐ Stars count
- 🔀 Forks count  
- 📝 Description
- 📜 License
- 🏠 Homepage URL

### From Package Registries:
- 📥 Download count (PyPI/npm/crates.io)
- 🏷️ Latest version
- 📦 Registry URL (PyPI/npm/crates.io link)
- 📚 Documentation URL

### Generated Data:
- 🔗 Install command (`pip install`, `npm install`, `cargo add`)
- 🎯 Popularity score (stars / 1000)
- 🏷️ Slug (URL-friendly name)
- 📅 Last updated timestamp

## 🎨 Supported Ecosystems

| Language | Ecosystem | Registry API | Example |
|----------|-----------|--------------|---------|
| Python | PyPI | `https://pypi.org/pypi/{package}/json` | `pip install numpy` |
| Node.js | npm | `https://registry.npmjs.org/{package}` | `npm install react` |
| Rust | crates.io | `https://crates.io/api/v1/crates/{package}` | `cargo add tokio` |

## 🔍 Auto-Detection

If you don't provide `githubRepo`, the script will search GitHub:

```typescript
// This will auto-detect the GitHub repo
{ name: 'tensorflow', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'] }

// Or you can specify it explicitly
{ name: 'tensorflow', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'tensorflow/tensorflow' }
```

## ⚡ Rate Limiting

The script includes:
- 1 second delay between requests to avoid hitting rate limits
- Automatic retry logic
- Graceful error handling (skips failed packages)

## 📦 Bulk Import Example

Want to import 100+ packages? Just add them to the array:

```typescript
const packagesToImport: PackageInput[] = [
  // Python ML/AI
  { name: 'tensorflow', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'] },
  { name: 'pytorch', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'] },
  { name: 'scikit-learn', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'] },
  { name: 'keras', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'] },
  
  // Python Web
  { name: 'flask', language: 'python', ecosystem: 'pypi', categories: ['Web Frameworks'] },
  { name: 'aiohttp', language: 'python', ecosystem: 'pypi', categories: ['Web Frameworks'] },
  { name: 'bottle', language: 'python', ecosystem: 'pypi', categories: ['Web Frameworks'] },
  
  // Node.js Frontend
  { name: 'vue', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'] },
  { name: 'angular', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'] },
  { name: 'svelte', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'] },
  
  // Add as many as you want...
];
```

## 🐛 Troubleshooting

### "Failed to fetch GitHub data"
- Check your `GITHUB_TOKEN` is set correctly
- Verify the repository name is correct (`owner/repo` format)
- Check if you've hit the rate limit (60/hour without token)

### "Failed to fetch registry data"
- Package name might be incorrect
- Package might not exist in that registry
- Registry API might be temporarily down

### "Package already exists"
- Package is already in your database
- Script will skip it automatically

## 🎯 After Importing

After importing packages:

1. **Sync with Meilisearch** (for search):
   ```bash
   npm run meilisearch:sync
   ```

2. **Generate embeddings** (for semantic search):
   ```bash
   npm run embeddings:generate
   ```

3. **Restart your server**:
   ```bash
   npm run dev
   ```

## 💡 Tips

- Start with a small batch (5-10 packages) to test
- Use the GitHub token to avoid rate limits
- Check the output for any failed imports
- You can re-run the script - it skips existing packages
- Add examples and alternatives manually later (optional)

## 🚀 Next Steps

Want even more packages? Create a CSV or JSON file with package names and modify the script to read from it:

```typescript
// packages.json
[
  {"name": "tensorflow", "language": "python", "ecosystem": "pypi", "categories": ["Machine Learning"]},
  {"name": "pytorch", "language": "python", "ecosystem": "pypi", "categories": ["Machine Learning"]},
  // ... hundreds more
]
```

Then update the script to read from this file instead of hardcoding the array.
