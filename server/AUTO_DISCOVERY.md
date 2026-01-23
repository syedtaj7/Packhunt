# 🤖 Automated Package Discovery System

## Overview

This system **automatically discovers and imports** popular packages from various registries - **no manual data entry required!**

## 🚀 Quick Start

### One Command to Rule Them All:

```bash
npm run auto-update
```

This single command will:
1. 🔍 **Discover** packages from npm, PyPI, crates.io, etc.
2. 📥 **Import** them into the database
3. 🔎 **Sync** to Meilisearch
4. 🧠 **Generate** embeddings for semantic search

**Sit back, relax, and watch the magic happen!** ✨

---

## 📋 Individual Steps

If you want more control, run these commands separately:

### Step 1: Discover Packages
```bash
npm run discover
```

**What it does:**
- Fetches top 150 npm packages
- Fetches top 100 PyPI packages  
- Fetches top 100 Rust crates
- Fetches top 50 Go packages
- Fetches top 50 Java packages
- Saves to `data/discovered-packages.json`

**Registries supported:**
- ✅ npm (Node.js) - via npms.io API
- ✅ PyPI (Python) - via PyPI JSON API
- ✅ crates.io (Rust) - via crates.io API
- ✅ pkg.go.dev (Go) - curated list
- ✅ Maven (Java) - curated list

### Step 2: Review & Import
```bash
npm run import-discovered
```

**What it does:**
- Reads `data/discovered-packages.json`
- Imports packages in parallel (15 at a time)
- Fetches GitHub metadata
- Fetches registry download stats
- Skips duplicates automatically

### Step 3: Sync to Meilisearch
```bash
npm run meilisearch:sync
```

### Step 4: Generate Embeddings
```bash
npm run embeddings:generate
```

---

## 🔧 How It Works

### Auto-Discovery Architecture

```
┌─────────────────────────────────────────┐
│   Registry APIs (npm, PyPI, etc.)      │
└──────────────┬──────────────────────────┘
               │
               │ fetch top packages
               ↓
┌─────────────────────────────────────────┐
│   auto-discover-packages.ts             │
│   • Queries each registry API           │
│   • Extracts GitHub repos               │
│   • Filters by popularity               │
└──────────────┬──────────────────────────┘
               │
               │ saves to JSON
               ↓
┌─────────────────────────────────────────┐
│   data/discovered-packages.json         │
│   [{ name, language, repo, ... }, ...]  │
└──────────────┬──────────────────────────┘
               │
               │ reads & imports
               ↓
┌─────────────────────────────────────────┐
│   import-discovered.ts                  │
│   • Parallel batch processing           │
│   • GitHub API for metadata             │
│   • Registry APIs for downloads         │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   PostgreSQL Database                    │
│   766+ packages ready to use! 🎉        │
└─────────────────────────────────────────┘
```

---

## 📊 Current Coverage

| Language | Registry | Discovery Method |
|----------|----------|------------------|
| Node.js | npm | npms.io API (ranked search) |
| Python | PyPI | PyPI JSON API + curated list |
| Rust | crates.io | crates.io API (by downloads) |
| Go | pkg.go.dev | Curated popular packages |
| Java | Maven | Curated popular packages |
| C# | NuGet | 🚧 Coming soon |
| Ruby | RubyGems | 🚧 Coming soon |
| PHP | Packagist | 🚧 Coming soon |

---

## 🎯 Adding More Registries

Want to add support for more languages? Easy!

1. Open `server/src/scripts/auto-discover-packages.ts`
2. Add a new function:

```typescript
async function discoverRubyGemsPackages(limit = 100): Promise<DiscoveredPackage[]> {
  console.log(`\n💎 Discovering top ${limit} RubyGems...`);
  const packages: DiscoveredPackage[] = [];
  
  // Your registry API calls here
  // const response = await axios.get('https://rubygems.org/api/...');
  
  return packages;
}
```

3. Call it in `autoDiscoverPackages()`:
```typescript
const rubyPackages = await discoverRubyGemsPackages(100);
allDiscoveredPackages.push(...rubyPackages);
```

Done! 🎉

---

## 🔄 Scheduling Automatic Updates

### Option 1: Cron Job (Linux/Mac)
```bash
# Run every Sunday at 2 AM
0 2 * * 0 cd /path/to/project/server && npm run auto-update
```

### Option 2: GitHub Actions
Create `.github/workflows/auto-update.yml`:

```yaml
name: Auto-Update Packages
on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2 AM
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd server && npm install
      - run: cd server && npm run auto-update
```

### Option 3: Node-Cron (In-App)
Add to your server:

```typescript
import cron from 'node-cron';
import { autoDiscoverPackages } from './scripts/auto-discover-packages';

// Run every Sunday at 2 AM
cron.schedule('0 2 * * 0', async () => {
  console.log('🤖 Running automated package update...');
  await autoDiscoverPackages();
});
```

---

## ⚡ Performance

- **Discovery**: ~30 seconds (depends on API rate limits)
- **Import**: ~3-5 minutes for 500 packages (parallel processing)
- **Sync**: ~10 seconds
- **Embeddings**: ~2-3 minutes for 500 packages

**Total**: ~10 minutes for complete automation! 🚀

---

## 🎛️ Configuration

### Customize Discovery Limits

Edit `auto-discover-packages.ts`:

```typescript
const npmPackages = await discoverNpmPackages(200);      // Get 200 instead of 150
const pypiPackages = await discoverPyPiPackages(150);    // Get 150 instead of 100
```

### Add GitHub Token (Recommended)

Set environment variable for higher rate limits:

```bash
export GITHUB_TOKEN=ghp_your_token_here
```

Without token: 60 requests/hour
With token: 5000 requests/hour

---

## 🐛 Troubleshooting

### "Too many requests" error
- Add `GITHUB_TOKEN` to your environment
- Reduce batch size in `import-discovered.ts`

### "No discovered packages file found"
- Run `npm run discover` first

### Packages failing to import
- Check GitHub repo names are correct
- Verify repos are public
- Check registry API availability

---

## 📈 Future Enhancements

- [ ] Add more registries (NuGet, RubyGems, Packagist)
- [ ] ML-based package quality scoring
- [ ] Automatic duplicate detection
- [ ] Trending package alerts
- [ ] Community package submissions
- [ ] Weekly email digest of new packages

---

## 🤝 Contributing

Want to add support for more registries? PRs welcome!

1. Fork the repo
2. Add your registry function in `auto-discover-packages.ts`
3. Test with `npm run discover`
4. Submit PR

---

## 📝 License

MIT - Use it however you want! 🎉

---

**Questions?** Open an issue on GitHub!

**Happy automating!** 🤖✨
