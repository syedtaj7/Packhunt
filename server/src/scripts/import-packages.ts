import { PrismaClient, Language } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// GitHub Personal Access Token (optional but increases rate limit)
// Get one at: https://github.com/settings/tokens
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

interface PackageInput {
  name: string;
  language: 'python' | 'nodejs' | 'rust' | 'go' | 'java' | 'csharp' | 'ruby' | 'php' | 'swift' | 'kotlin' | 'dart' | 'elixir' | 'haskell' | 'scala' | 'cpp' | 'r' | 'julia';
  ecosystem: 'pypi' | 'npm' | 'crates.io' | 'pkg.go.dev' | 'maven' | 'nuget' | 'rubygems' | 'packagist' | 'CocoaPods' | 'pub.dev' | 'hex.pm' | 'Hackage' | 'vcpkg' | 'CRAN' | 'JuliaRegistries';
  categories: string[];
  githubRepo?: string; // e.g., "numpy/numpy"
}

interface GitHubRepoData {
  name: string;
  description: string;
  stars: number;
  forks: number;
  license: string;
  homepage: string | null;
  defaultBranch: string;
}

interface RegistryData {
  downloads: number;
  latestVersion: string;
  registryUrl: string;
  docsUrl?: string;
}

/**
 * Fetch repository data from GitHub API
 */
async function fetchGitHubData(repo: string): Promise<GitHubRepoData | null> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const response = await axios.get(`https://api.github.com/repos/${repo}`, { headers });
    const data = response.data;

    return {
      name: data.name,
      description: data.description || 'No description available',
      stars: data.stargazers_count,
      forks: data.forks_count,
      license: data.license?.spdx_id || 'Unknown',
      homepage: data.homepage,
      defaultBranch: data.default_branch,
    };
  } catch (error: unknown) {
    console.error(`❌ Failed to fetch GitHub data for ${repo}:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Fetch package data from PyPI
 */
async function fetchPyPIData(packageName: string): Promise<RegistryData | null> {
  try {
    const response = await axios.get(`https://pypi.org/pypi/${packageName}/json`);
    const data = response.data;

    // Get download stats from pypistats.org (last month)
    let downloads = 0;
    try {
      const statsResponse = await axios.get(
        `https://pypistats.org/api/packages/${packageName}/recent`,
        { timeout: 5000 }
      );
      downloads = statsResponse.data.data?.last_month || 0;
    } catch {
      // Stats API might be unavailable, use default
      downloads = 100000;
    }

    return {
      downloads,
      latestVersion: data.info.version,
      registryUrl: `https://pypi.org/project/${packageName}/`,
      docsUrl: data.info.project_urls?.Documentation || data.info.home_page || undefined,
    };
  } catch (error: unknown) {
    console.error(`❌ Failed to fetch PyPI data for ${packageName}:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Fetch package data from npm
 */
async function fetchNpmData(packageName: string): Promise<RegistryData | null> {
  try {
    const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
    const data = response.data;

    // Get download stats from npm (last week * 4 for monthly estimate)
    let downloads = 0;
    try {
      const statsResponse = await axios.get(
        `https://api.npmjs.org/downloads/point/last-week/${packageName}`,
        { timeout: 5000 }
      );
      downloads = (statsResponse.data.downloads || 0) * 4;
    } catch {
      downloads = 100000;
    }

    const latestVersion = data['dist-tags']?.latest || '0.0.0';
    const docsUrl = data.homepage || data.repository?.url?.replace('git+', '').replace('.git', '');

    return {
      downloads,
      latestVersion,
      registryUrl: `https://www.npmjs.com/package/${packageName}`,
      docsUrl,
    };
  } catch (error: unknown) {
    console.error(`❌ Failed to fetch npm data for ${packageName}:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Fetch package data from crates.io
 */
async function fetchCratesData(packageName: string): Promise<RegistryData | null> {
  try {
    const response = await axios.get(`https://crates.io/api/v1/crates/${packageName}`, {
      headers: { 'User-Agent': 'PackHunt (package-compass)' }
    });
    const data = response.data.crate;

    return {
      downloads: data.downloads,
      latestVersion: data.newest_version,
      registryUrl: `https://crates.io/crates/${packageName}`,
      docsUrl: data.documentation || `https://docs.rs/${packageName}/`,
    };
  } catch (error: unknown) {
    console.error(`❌ Failed to fetch crates.io data for ${packageName}:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Generic fallback for registries without public APIs
 */
async function fetchGenericRegistryData(packageName: string, ecosystem: string, stars?: number): Promise<RegistryData | null> {
  try {
    const registryUrls: Record<string, string> = {
      'CocoaPods': `https://cocoapods.org/pods/${packageName}`,
      'pub.dev': `https://pub.dev/packages/${packageName}`,
      'hex.pm': `https://hex.pm/packages/${packageName}`,
      'Hackage': `https://hackage.haskell.org/package/${packageName}`,
      'vcpkg': `https://vcpkg.io/en/package/${packageName}`,
      'CRAN': `https://cran.r-project.org/package=${packageName}`,
      'JuliaRegistries': `https://juliahub.com/ui/Packages/General/${packageName}`,
      'pkg.go.dev': `https://pkg.go.dev/${packageName}`,
      'maven': `https://mvnrepository.com/artifact/${packageName}`,
      'nuget': `https://www.nuget.org/packages/${packageName}`,
      'rubygems': `https://rubygems.org/gems/${packageName}`,
      'packagist': `https://packagist.org/packages/${packageName}`,
    };

    // Estimate downloads based on GitHub stars (if available)
    const estimatedDownloads = stars ? Math.max(stars * 100, 10000) : 50000;

    return {
      downloads: estimatedDownloads,
      latestVersion: '1.0.0',
      registryUrl: registryUrls[ecosystem] || '',
      docsUrl: undefined,
    };
  } catch (error: unknown) {
    console.error(`❌ Failed to fetch generic registry data for ${packageName}:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Auto-detect GitHub repository from package name
 */
async function findGitHubRepo(packageName: string, language: string): Promise<string | null> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    // Search GitHub for the package
    const query = `${packageName} language:${language} in:name`;
    const response = await axios.get(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc`,
      { headers }
    );

    if (response.data.items && response.data.items.length > 0) {
      const topRepo = response.data.items[0];
      return topRepo.full_name; // e.g., "numpy/numpy"
    }
  } catch (error: unknown) {
    console.error(`❌ Failed to find GitHub repo for ${packageName}:`, error instanceof Error ? error.message : 'Unknown error');
  }
  return null;
}

/**
 * Generate install command based on ecosystem
 */
function getInstallCommand(ecosystem: string, packageName: string): string {
  switch (ecosystem) {
    case 'pypi':
      return `pip install ${packageName}`;
    case 'npm':
      return `npm install ${packageName}`;
    case 'crates.io':
      return `cargo add ${packageName}`;
    case 'pkg.go.dev':
      return `go get ${packageName}`;
    case 'maven':
      return `mvn dependency:get -Dartifact=${packageName}`;
    case 'nuget':
      return `dotnet add package ${packageName}`;
    case 'rubygems':
      return `gem install ${packageName}`;
    case 'packagist':
      return `composer require ${packageName}`;
    case 'CocoaPods':
      return `pod '${packageName}'`;
    case 'pub.dev':
      return `flutter pub add ${packageName}`;
    case 'hex.pm':
      return `{:${packageName}, "~> 1.0"}`;
    case 'Hackage':
      return `cabal install ${packageName}`;
    case 'vcpkg':
      return `vcpkg install ${packageName}`;
    case 'CRAN':
      return `install.packages("${packageName}")`;
    case 'JuliaRegistries':
      return `] add ${packageName}`;
    default:
      return '';
  }
}

/**
 * Import a single package
 */
async function importPackage(input: PackageInput): Promise<boolean> {
  console.log(`\n📦 Importing ${input.name}...`);

  try {
    // 1. Find or use provided GitHub repo
    let githubRepo = input.githubRepo;
    if (!githubRepo) {
      console.log('  🔍 Auto-detecting GitHub repository...');
      githubRepo = await findGitHubRepo(input.name, input.language) ?? undefined;
      if (!githubRepo) {
        console.log('  ⚠️  Could not find GitHub repository');
        return false;
      }
    }
    console.log(`  ✓ Found repo: ${githubRepo}`);

    // 2. Fetch GitHub data
    console.log('  🔍 Fetching GitHub data...');
    const githubData = await fetchGitHubData(githubRepo);
    if (!githubData) {
      console.log('  ❌ Failed to fetch GitHub data');
      return false;
    }
    console.log(`  ✓ Stars: ${githubData.stars.toLocaleString()}`);

    // 3. Fetch registry data
    console.log('  🔍 Fetching registry data...');
    let registryData: RegistryData | null = null;
    
    switch (input.ecosystem) {
      case 'pypi':
        registryData = await fetchPyPIData(input.name);
        break;
      case 'npm':
        registryData = await fetchNpmData(input.name);
        break;
      case 'crates.io':
        registryData = await fetchCratesData(input.name);
        break;
      default:
        registryData = await fetchGenericRegistryData(input.name, input.ecosystem, githubData.stars);
        break;
    }

    if (!registryData) {
      console.log('  ❌ Failed to fetch registry data');
      return false;
    }
    console.log(`  ✓ Downloads: ${registryData.downloads.toLocaleString()}`);

    // 4. Check if package already exists
    const existing = await prisma.package.findUnique({
      where: { slug: input.name.toLowerCase() },
    });

    if (existing) {
      console.log('  ⚠️  Package already exists, skipping...');
      return false;
    }

    // 5. Create package in database
    const languageEnum = input.language.toUpperCase() as Language;
    
    const pkg = await prisma.package.create({
      data: {
        name: input.name,
        slug: input.name.toLowerCase(),
        description: githubData.description,
        language: languageEnum,
        ecosystem: input.ecosystem,
        stars: githubData.stars,
        forks: githubData.forks,
        downloads: registryData.downloads,
        license: githubData.license,
        lastUpdated: new Date(),
        popularityScore: githubData.stars / 1000,
        githubUrl: `https://github.com/${githubRepo}`,
        registryUrl: registryData.registryUrl,
        docsUrl: registryData.docsUrl || githubData.homepage,
        homepageUrl: githubData.homepage,
        readme: githubData.description,
        installCommand: getInstallCommand(input.ecosystem, input.name),
      },
    });

    // 6. Connect categories
    for (const catName of input.categories) {
      const category = await prisma.category.findUnique({ where: { name: catName } });
      if (category) {
        await prisma.package.update({
          where: { id: pkg.id },
          data: { categories: { connect: { id: category.id } } },
        });
      }
    }

    console.log(`  ✅ Successfully imported ${input.name}`);
    return true;

  } catch (error: unknown) {
    console.error(`  ❌ Failed to import ${input.name}:`, error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

/**
 * Main import function
 */
async function main() {
  console.log('🚀 Starting package import...\n');

  if (!GITHUB_TOKEN) {
    console.log('⚠️  No GITHUB_TOKEN found. Rate limit: 60 requests/hour');
    console.log('   Get a token at: https://github.com/settings/tokens');
    console.log('   Then set: export GITHUB_TOKEN=your_token_here\n');
  }

// Define packages to import
const packagesToImport: PackageInput[] = [
  // ============= PYTHON =============
  // Machine Learning & AI
  { name: 'tensorflow', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'tensorflow/tensorflow' },
  { name: 'pytorch', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'pytorch/pytorch' },
  { name: 'scikit-learn', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'scikit-learn/scikit-learn' },
  { name: 'keras', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'keras-team/keras' },
  { name: 'transformers', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'huggingface/transformers' },
  { name: 'langchain', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'langchain-ai/langchain' },
  
  // Web Frameworks
  { name: 'django', language: 'python', ecosystem: 'pypi', categories: ['Web Frameworks'], githubRepo: 'django/django' },
  { name: 'fastapi', language: 'python', ecosystem: 'pypi', categories: ['Web Frameworks'], githubRepo: 'tiangolo/fastapi' },
  { name: 'flask', language: 'python', ecosystem: 'pypi', categories: ['Web Frameworks'], githubRepo: 'pallets/flask' },
  { name: 'starlette', language: 'python', ecosystem: 'pypi', categories: ['Web Frameworks'], githubRepo: 'encode/starlette' },
  { name: 'sanic', language: 'python', ecosystem: 'pypi', categories: ['Web Frameworks'], githubRepo: 'sanic-org/sanic' },
  
  // Data Science & Analysis
  { name: 'pandas', language: 'python', ecosystem: 'pypi', categories: ['Data Science'], githubRepo: 'pandas-dev/pandas' },
  { name: 'numpy', language: 'python', ecosystem: 'pypi', categories: ['Data Science'], githubRepo: 'numpy/numpy' },
  { name: 'scipy', language: 'python', ecosystem: 'pypi', categories: ['Data Science'], githubRepo: 'scipy/scipy' },
  { name: 'matplotlib', language: 'python', ecosystem: 'pypi', categories: ['Data Science', 'Visualization'], githubRepo: 'matplotlib/matplotlib' },
  { name: 'seaborn', language: 'python', ecosystem: 'pypi', categories: ['Data Science', 'Visualization'], githubRepo: 'mwaskom/seaborn' },
  { name: 'plotly', language: 'python', ecosystem: 'pypi', categories: ['Visualization'], githubRepo: 'plotly/plotly.py' },
  { name: 'bokeh', language: 'python', ecosystem: 'pypi', categories: ['Visualization'], githubRepo: 'bokeh/bokeh' },
  
  // CLI & Development Tools
  { name: 'black', language: 'python', ecosystem: 'pypi', categories: ['CLI Tools'], githubRepo: 'psf/black' },
  { name: 'ruff', language: 'python', ecosystem: 'pypi', categories: ['CLI Tools'], githubRepo: 'astral-sh/ruff' },
  { name: 'mypy', language: 'python', ecosystem: 'pypi', categories: ['CLI Tools'], githubRepo: 'python/mypy' },
  { name: 'pytest', language: 'python', ecosystem: 'pypi', categories: ['Testing'], githubRepo: 'pytest-dev/pytest' },
  { name: 'pylint', language: 'python', ecosystem: 'pypi', categories: ['CLI Tools'], githubRepo: 'pylint-dev/pylint' },
  
  // Web Scraping & Automation
  { name: 'requests', language: 'python', ecosystem: 'pypi', categories: ['Web Development'], githubRepo: 'psf/requests' },
  { name: 'selenium', language: 'python', ecosystem: 'pypi', categories: ['Testing', 'Automation'], githubRepo: 'SeleniumHQ/selenium' },
  { name: 'beautifulsoup4', language: 'python', ecosystem: 'pypi', categories: ['Web Development'], githubRepo: 'waylan/beautifulsoup' },
  { name: 'scrapy', language: 'python', ecosystem: 'pypi', categories: ['Web Development'], githubRepo: 'scrapy/scrapy' },
  
  // Database & ORM
  { name: 'sqlalchemy', language: 'python', ecosystem: 'pypi', categories: ['Database'], githubRepo: 'sqlalchemy/sqlalchemy' },
  { name: 'psycopg2', language: 'python', ecosystem: 'pypi', categories: ['Database'], githubRepo: 'psycopg/psycopg2' },
  { name: 'pymongo', language: 'python', ecosystem: 'pypi', categories: ['Database'], githubRepo: 'mongodb/mongo-python-driver' },
  { name: 'redis', language: 'python', ecosystem: 'pypi', categories: ['Database'], githubRepo: 'redis/redis-py' },
  
  // Async & Networking
  { name: 'asyncio', language: 'python', ecosystem: 'pypi', categories: ['Async Programming'], githubRepo: 'python/cpython' },
  { name: 'aiohttp', language: 'python', ecosystem: 'pypi', categories: ['Web Frameworks', 'Async Programming'], githubRepo: 'aio-libs/aiohttp' },
  { name: 'httpx', language: 'python', ecosystem: 'pypi', categories: ['Web Development'], githubRepo: 'encode/httpx' },
  
  // Data Processing
  { name: 'polars', language: 'python', ecosystem: 'pypi', categories: ['Data Science'], githubRepo: 'pola-rs/polars' },
  { name: 'dask', language: 'python', ecosystem: 'pypi', categories: ['Data Science'], githubRepo: 'dask/dask' },
  { name: 'vaex', language: 'python', ecosystem: 'pypi', categories: ['Data Science'], githubRepo: 'vaexio/vaex' },
  
  // GUI & Desktop Apps
  { name: 'pyqt5', language: 'python', ecosystem: 'pypi', categories: ['GUI'], githubRepo: 'riverbankcomputing/pyqt5' },
  { name: 'tkinter', language: 'python', ecosystem: 'pypi', categories: ['GUI'], githubRepo: 'python/cpython' },
  
  // Image Processing
  { name: 'opencv-python', language: 'python', ecosystem: 'pypi', categories: ['Data Science', 'Machine Learning'], githubRepo: 'opencv/opencv' },
  { name: 'pillow', language: 'python', ecosystem: 'pypi', categories: ['Data Science'], githubRepo: 'python-pillow/Pillow' },
  
  // Scientific Computing
  { name: 'sympy', language: 'python', ecosystem: 'pypi', categories: ['Data Science'], githubRepo: 'sympy/sympy' },
  { name: 'jax', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'google/jax' },
  
  // Stream Processing
  { name: 'streamlit', language: 'python', ecosystem: 'pypi', categories: ['Visualization'], githubRepo: 'streamlit/streamlit' },
  { name: 'gradio', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'gradio-app/gradio' },

  // ============= NODE.JS / JAVASCRIPT =============
  // Frontend Frameworks
  { name: 'react', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'], githubRepo: 'facebook/react' },
  { name: 'vue', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'], githubRepo: 'vuejs/core' },
  { name: 'angular', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'], githubRepo: 'angular/angular' },
  { name: 'svelte', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'], githubRepo: 'sveltejs/svelte' },
  { name: 'next', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'], githubRepo: 'vercel/next.js' },
  { name: 'nuxt', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'], githubRepo: 'nuxt/nuxt' },
  { name: 'remix', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'], githubRepo: 'remix-run/remix' },
  { name: 'astro', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'], githubRepo: 'withastro/astro' },
  
  // Backend Frameworks
  { name: 'express', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'], githubRepo: 'expressjs/express' },
  { name: 'nestjs', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'], githubRepo: 'nestjs/nest' },
  { name: 'fastify', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'], githubRepo: 'fastify/fastify' },
  { name: 'koa', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'], githubRepo: 'koajs/koa' },
  { name: 'hapi', language: 'nodejs', ecosystem: 'npm', categories: ['Web Frameworks'], githubRepo: 'hapijs/hapi' },
  
  // Build Tools & Bundlers
  { name: 'webpack', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'webpack/webpack' },
  { name: 'vite', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'vitejs/vite' },
  { name: 'rollup', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'rollup/rollup' },
  { name: 'esbuild', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'evanw/esbuild' },
  { name: 'turbo', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'vercel/turbo' },
  
  // Code Quality & Formatting
  { name: 'eslint', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'eslint/eslint' },
  { name: 'prettier', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'prettier/prettier' },
  { name: 'typescript', language: 'nodejs', ecosystem: 'npm', categories: ['Language'], githubRepo: 'microsoft/TypeScript' },
  { name: 'jest', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'jestjs/jest' },
  { name: 'mocha', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'mochajs/mocha' },
  { name: 'cypress', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'cypress-io/cypress' },
  
  // Database & ORM
  { name: 'mongoose', language: 'nodejs', ecosystem: 'npm', categories: ['Database'], githubRepo: 'Automattic/mongoose' },
  { name: 'prisma', language: 'nodejs', ecosystem: 'npm', categories: ['Database'], githubRepo: 'prisma/prisma' },
  { name: 'sequelize', language: 'nodejs', ecosystem: 'npm', categories: ['Database'], githubRepo: 'sequelize/sequelize' },
  { name: 'typeorm', language: 'nodejs', ecosystem: 'npm', categories: ['Database'], githubRepo: 'typeorm/typeorm' },
  { name: 'redis', language: 'nodejs', ecosystem: 'npm', categories: ['Database'], githubRepo: 'redis/node-redis' },
  
  // API Development
  { name: 'graphql', language: 'nodejs', ecosystem: 'npm', categories: ['API Development'], githubRepo: 'graphql/graphql-js' },
  { name: 'apollo-server', language: 'nodejs', ecosystem: 'npm', categories: ['API Development'], githubRepo: 'apollographql/apollo-server' },
  { name: 'swagger-ui-express', language: 'nodejs', ecosystem: 'npm', categories: ['API Development'], githubRepo: 'swagger-api/swagger-ui' },
  { name: 'tsoa', language: 'nodejs', ecosystem: 'npm', categories: ['API Development'], githubRepo: 'lukeautry/tsoa' },
  
  // Authentication & Security
  { name: 'passport', language: 'nodejs', ecosystem: 'npm', categories: ['Security'], githubRepo: 'jaredhanson/passport' },
  { name: 'jsonwebtoken', language: 'nodejs', ecosystem: 'npm', categories: ['Security'], githubRepo: 'auth0/node-jsonwebtoken' },
  { name: 'bcrypt', language: 'nodejs', ecosystem: 'npm', categories: ['Security'], githubRepo: 'kelektiv/node.bcrypt.js' },
  { name: 'helmet', language: 'nodejs', ecosystem: 'npm', categories: ['Security'], githubRepo: 'helmetjs/helmet' },
  
  // Validation & Serialization
  { name: 'zod', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'colinhacks/zod' },
  { name: 'joi', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'hapi-joi/joi' },
  { name: 'yup', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'jquense/yup' },
  { name: 'class-validator', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'typestack/class-validator' },
  
  // Real-time & WebSockets
  { name: 'socket.io', language: 'nodejs', ecosystem: 'npm', categories: ['Real-time'], githubRepo: 'socketio/socket.io' },
  { name: 'ws', language: 'nodejs', ecosystem: 'npm', categories: ['Real-time'], githubRepo: 'websockets/ws' },
  
  // UI Libraries & Components
  { name: 'material-ui', language: 'nodejs', ecosystem: 'npm', categories: ['UI Libraries'], githubRepo: 'mui/material-ui' },
  { name: 'ant-design', language: 'nodejs', ecosystem: 'npm', categories: ['UI Libraries'], githubRepo: 'ant-design/ant-design' },
  { name: 'chakra-ui', language: 'nodejs', ecosystem: 'npm', categories: ['UI Libraries'], githubRepo: 'chakra-ui/chakra-ui' },
  { name: 'tailwindcss', language: 'nodejs', ecosystem: 'npm', categories: ['UI Libraries'], githubRepo: 'tailwindlabs/tailwindcss' },
  
  // State Management
  { name: 'redux', language: 'nodejs', ecosystem: 'npm', categories: ['State Management'], githubRepo: 'reduxjs/redux' },
  { name: 'mobx', language: 'nodejs', ecosystem: 'npm', categories: ['State Management'], githubRepo: 'mobxjs/mobx' },
  { name: 'zustand', language: 'nodejs', ecosystem: 'npm', categories: ['State Management'], githubRepo: 'pmndrs/zustand' },
  { name: 'recoil', language: 'nodejs', ecosystem: 'npm', categories: ['State Management'], githubRepo: 'facebookexperimental/Recoil' },
  
  // Testing
  { name: 'vitest', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'vitest-dev/vitest' },
  { name: 'playwright', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'microsoft/playwright' },
  { name: 'testing-library', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'testing-library/react-testing-library' },

  // ============= RUST =============
  // Error Handling
  { name: 'anyhow', language: 'rust', ecosystem: 'crates.io', categories: ['Error Handling'], githubRepo: 'dtolnay/anyhow' },
  { name: 'thiserror', language: 'rust', ecosystem: 'crates.io', categories: ['Error Handling'], githubRepo: 'dtolnay/thiserror' },
  
  // Logging & Tracing
  { name: 'tracing', language: 'rust', ecosystem: 'crates.io', categories: ['Observability'], githubRepo: 'tokio-rs/tracing' },
  { name: 'log', language: 'rust', ecosystem: 'crates.io', categories: ['Observability'], githubRepo: 'rust-lang/log' },
  { name: 'env_logger', language: 'rust', ecosystem: 'crates.io', categories: ['Observability'], githubRepo: 'rust-cli/env_logger' },
  
  // Async Programming
  { name: 'tokio', language: 'rust', ecosystem: 'crates.io', categories: ['Async Programming'], githubRepo: 'tokio-rs/tokio' },
  { name: 'async-std', language: 'rust', ecosystem: 'crates.io', categories: ['Async Programming'], githubRepo: 'async-rs/async-std' },
  { name: 'async-trait', language: 'rust', ecosystem: 'crates.io', categories: ['Async Programming'], githubRepo: 'dtolnay/async-trait' },
  { name: 'futures', language: 'rust', ecosystem: 'crates.io', categories: ['Async Programming'], githubRepo: 'rust-lang/futures-rs' },
  
  // Web Frameworks
  { name: 'actix-web', language: 'rust', ecosystem: 'crates.io', categories: ['Web Frameworks'], githubRepo: 'actix/actix-web' },
  { name: 'rocket', language: 'rust', ecosystem: 'crates.io', categories: ['Web Frameworks'], githubRepo: 'SergioBenitez/Rocket' },
  { name: 'warp', language: 'rust', ecosystem: 'crates.io', categories: ['Web Frameworks'], githubRepo: 'seanmonstar/warp' },
  { name: 'axum', language: 'rust', ecosystem: 'crates.io', categories: ['Web Frameworks'], githubRepo: 'tokio-rs/axum' },
  { name: 'hyper', language: 'rust', ecosystem: 'crates.io', categories: ['Web Frameworks'], githubRepo: 'hyperium/hyper' },
  { name: 'poem', language: 'rust', ecosystem: 'crates.io', categories: ['Web Frameworks'], githubRepo: 'poem-web/poem' },
  
  // Serialization & Deserialization
  { name: 'serde', language: 'rust', ecosystem: 'crates.io', categories: ['Serialization'], githubRepo: 'serde-rs/serde' },
  { name: 'serde_json', language: 'rust', ecosystem: 'crates.io', categories: ['Serialization'], githubRepo: 'serde-rs/json' },
  { name: 'bincode', language: 'rust', ecosystem: 'crates.io', categories: ['Serialization'], githubRepo: 'bincode-org/bincode' },
  
  // CLI Development
  { name: 'clap', language: 'rust', ecosystem: 'crates.io', categories: ['CLI Tools'], githubRepo: 'clap-rs/clap' },
  { name: 'structopt', language: 'rust', ecosystem: 'crates.io', categories: ['CLI Tools'], githubRepo: 'TeXitoi/structopt' },
  { name: 'inquire', language: 'rust', ecosystem: 'crates.io', categories: ['CLI Tools'], githubRepo: 'mikaelmello/inquire' },
  
  // Database
  { name: 'diesel', language: 'rust', ecosystem: 'crates.io', categories: ['Database'], githubRepo: 'diesel-rs/diesel' },
  { name: 'sqlx', language: 'rust', ecosystem: 'crates.io', categories: ['Database'], githubRepo: 'launchbadge/sqlx' },
  { name: 'sea-orm', language: 'rust', ecosystem: 'crates.io', categories: ['Database'], githubRepo: 'SeaQL/sea-orm' },
  { name: 'redis', language: 'rust', ecosystem: 'crates.io', categories: ['Database'], githubRepo: 'redis-rs/redis-rs' },
  { name: 'mongodb', language: 'rust', ecosystem: 'crates.io', categories: ['Database'], githubRepo: 'mongodb/mongo-rust-driver' },
  
  // Cryptography & Security
  { name: 'ring', language: 'rust', ecosystem: 'crates.io', categories: ['Security'], githubRepo: 'briansmith/ring' },
  { name: 'bcrypt', language: 'rust', ecosystem: 'crates.io', categories: ['Security'], githubRepo: 'kevinmehall/rust-bcrypt' },
  { name: 'jsonwebtoken', language: 'rust', ecosystem: 'crates.io', categories: ['Security'], githubRepo: 'Keats/jsonwebtoken' },
  
  // Testing & Mocking
  { name: 'mockall', language: 'rust', ecosystem: 'crates.io', categories: ['Testing'], githubRepo: 'asomers/mockall' },
  { name: 'proptest', language: 'rust', ecosystem: 'crates.io', categories: ['Testing'], githubRepo: 'proptest-rs/proptest' },
  
  // Configuration
  { name: 'config', language: 'rust', ecosystem: 'crates.io', categories: ['Configuration'], githubRepo: 'mehcode/config-rs' },
  { name: 'dotenv', language: 'rust', ecosystem: 'crates.io', categories: ['Configuration'], githubRepo: 'dotenv-rs/dotenv' },
  
  // Utility & Data Structures
  { name: 'chrono', language: 'rust', ecosystem: 'crates.io', categories: ['Utilities'], githubRepo: 'chronotope/chrono' },
  { name: 'regex', language: 'rust', ecosystem: 'crates.io', categories: ['Utilities'], githubRepo: 'rust-lang/regex' },
  { name: 'uuid', language: 'rust', ecosystem: 'crates.io', categories: ['Utilities'], githubRepo: 'uuid-rs/uuid' },
  { name: 'rand', language: 'rust', ecosystem: 'crates.io', categories: ['Utilities'], githubRepo: 'rust-random/rand' },
  { name: 'lazy_static', language: 'rust', ecosystem: 'crates.io', categories: ['Utilities'], githubRepo: 'rust-lang-nursery/lazy-static.rs' },
  { name: 'itertools', language: 'rust', ecosystem: 'crates.io', categories: ['Utilities'], githubRepo: 'rust-itertools/itertools' },
  
  // WebAssembly
  { name: 'wasm-bindgen', language: 'rust', ecosystem: 'crates.io', categories: ['WebAssembly'], githubRepo: 'rustwasm/wasm-bindgen' },
  { name: 'js-sys', language: 'rust', ecosystem: 'crates.io', categories: ['WebAssembly'], githubRepo: 'rustwasm/wasm-bindgen' },
  { name: 'web-sys', language: 'rust', ecosystem: 'crates.io', categories: ['WebAssembly'], githubRepo: 'rustwasm/wasm-bindgen' },
  
  // GraphQL
  { name: 'juniper', language: 'rust', ecosystem: 'crates.io', categories: ['API Development'], githubRepo: 'graphql-rust/juniper' },
  { name: 'async-graphql', language: 'rust', ecosystem: 'crates.io', categories: ['API Development'], githubRepo: 'async-graphql/async-graphql' },

  // ============= GO =============
  { name: 'gin', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Web Frameworks'], githubRepo: 'gin-gonic/gin' },
  { name: 'echo', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Web Frameworks'], githubRepo: 'labstack/echo' },
  { name: 'fiber', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Web Frameworks'], githubRepo: 'gofiber/fiber' },
  { name: 'gorilla/mux', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Web Frameworks'], githubRepo: 'gorilla/mux' },
  { name: 'testify', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Testing'], githubRepo: 'stretchr/testify' },
  { name: 'gorm', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Database'], githubRepo: 'go-gorm/gorm' },
  { name: 'sqlx', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Database'], githubRepo: 'jmoiron/sqlx' },
  { name: 'cobra', language: 'go', ecosystem: 'pkg.go.dev', categories: ['CLI Tools'], githubRepo: 'spf13/cobra' },
  { name: 'viper', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Configuration'], githubRepo: 'spf13/viper' },
  { name: 'zap', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Observability'], githubRepo: 'uber-go/zap' },
  { name: 'logrus', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Observability'], githubRepo: 'sirupsen/logrus' },
  { name: 'redis', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Database'], githubRepo: 'go-redis/redis' },
  { name: 'go-chi', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Web Frameworks'], githubRepo: 'go-chi/chi' },
  { name: 'kit', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Microservices'], githubRepo: 'go-kit/kit' },
  { name: 'grpc-go', language: 'go', ecosystem: 'pkg.go.dev', categories: ['RPC'], githubRepo: 'grpc/grpc-go' },
  { name: 'protobuf', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Serialization'], githubRepo: 'golang/protobuf' },
  { name: 'validator', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Validation'], githubRepo: 'go-playground/validator' },
  { name: 'migrate', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Database'], githubRepo: 'golang-migrate/migrate' },

  // ============= JAVA =============
  { name: 'spring-boot', language: 'java', ecosystem: 'maven', categories: ['Web Frameworks'], githubRepo: 'spring-projects/spring-boot' },
  { name: 'hibernate', language: 'java', ecosystem: 'maven', categories: ['Database'], githubRepo: 'hibernate/hibernate-orm' },
  { name: 'lombok', language: 'java', ecosystem: 'maven', categories: ['Productivity'], githubRepo: 'projectlombok/lombok' },
  { name: 'jackson', language: 'java', ecosystem: 'maven', categories: ['Serialization'], githubRepo: 'FasterXML/jackson' },
  { name: 'junit', language: 'java', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'junit-team/junit5' },
  { name: 'mockito', language: 'java', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'mockito/mockito' },
  { name: 'log4j', language: 'java', ecosystem: 'maven', categories: ['Observability'], githubRepo: 'apache/logging-log4j2' },
  { name: 'slf4j', language: 'java', ecosystem: 'maven', categories: ['Observability'], githubRepo: 'qos-ch/slf4j' },
  { name: 'apache-commons', language: 'java', ecosystem: 'maven', categories: ['Utilities'], githubRepo: 'apache/commons-lang' },
  { name: 'guava', language: 'java', ecosystem: 'maven', categories: ['Utilities'], githubRepo: 'google/guava' },

  // ============= C# / .NET =============
  { name: 'EntityFramework', language: 'csharp', ecosystem: 'nuget', categories: ['Database'], githubRepo: 'dotnet/efcore' },
  { name: 'Newtonsoft.Json', language: 'csharp', ecosystem: 'nuget', categories: ['Serialization'], githubRepo: 'JamesNK/Newtonsoft.Json' },
  { name: 'Serilog', language: 'csharp', ecosystem: 'nuget', categories: ['Observability'], githubRepo: 'serilog/serilog' },
  { name: 'AutoMapper', language: 'csharp', ecosystem: 'nuget', categories: ['Productivity'], githubRepo: 'AutoMapper/AutoMapper' },
  { name: 'NUnit', language: 'csharp', ecosystem: 'nuget', categories: ['Testing'], githubRepo: 'nunit/nunit' },
  { name: 'Moq', language: 'csharp', ecosystem: 'nuget', categories: ['Testing'], githubRepo: 'moq/moq' },
  { name: 'Polly', language: 'csharp', ecosystem: 'nuget', categories: ['Resilience'], githubRepo: 'App-vNext/Polly' },
  { name: 'MediatR', language: 'csharp', ecosystem: 'nuget', categories: ['Mediator'], githubRepo: 'jbogard/MediatR' },
  { name: 'FluentValidation', language: 'csharp', ecosystem: 'nuget', categories: ['Validation'], githubRepo: 'FluentValidation/FluentValidation' },
  { name: 'Dapper', language: 'csharp', ecosystem: 'nuget', categories: ['Database'], githubRepo: 'StackExchange/Dapper' },

  // ============= RUBY =============
  { name: 'rails', language: 'ruby', ecosystem: 'rubygems', categories: ['Web Frameworks'], githubRepo: 'rails/rails' },
  { name: 'sinatra', language: 'ruby', ecosystem: 'rubygems', categories: ['Web Frameworks'], githubRepo: 'sinatra/sinatra' },
  { name: 'puma', language: 'ruby', ecosystem: 'rubygems', categories: ['Web Servers'], githubRepo: 'puma/puma' },
  { name: 'devise', language: 'ruby', ecosystem: 'rubygems', categories: ['Authentication'], githubRepo: 'heartcombo/devise' },
  { name: 'rspec', language: 'ruby', ecosystem: 'rubygems', categories: ['Testing'], githubRepo: 'rspec/rspec' },
  { name: 'sidekiq', language: 'ruby', ecosystem: 'rubygems', categories: ['Background Jobs'], githubRepo: 'sidekiq/sidekiq' },
  { name: 'factory_bot', language: 'ruby', ecosystem: 'rubygems', categories: ['Testing'], githubRepo: 'thoughtbot/factory_bot' },
  { name: 'faker', language: 'ruby', ecosystem: 'rubygems', categories: ['Testing'], githubRepo: 'faker-ruby/faker' },

  // ============= PHP =============
  { name: 'laravel', language: 'php', ecosystem: 'packagist', categories: ['Web Frameworks'], githubRepo: 'laravel/laravel' },
  { name: 'symfony', language: 'php', ecosystem: 'packagist', categories: ['Web Frameworks'], githubRepo: 'symfony/symfony' },
  { name: 'composer', language: 'php', ecosystem: 'packagist', categories: ['Package Manager'], githubRepo: 'composer/composer' },
  { name: 'phpunit', language: 'php', ecosystem: 'packagist', categories: ['Testing'], githubRepo: 'sebastianbergmann/phpunit' },
  { name: 'guzzle', language: 'php', ecosystem: 'packagist', categories: ['HTTP Client'], githubRepo: 'guzzle/guzzle' },
  { name: 'monolog', language: 'php', ecosystem: 'packagist', categories: ['Logging'], githubRepo: 'Seldaek/monolog' },
  { name: 'doctrine', language: 'php', ecosystem: 'packagist', categories: ['Database'], githubRepo: 'doctrine/orm' },

  // ============= SWIFT =============
  { name: 'Alamofire', language: 'swift', ecosystem: 'CocoaPods', categories: ['Networking'], githubRepo: 'Alamofire/Alamofire' },
  { name: 'SnapKit', language: 'swift', ecosystem: 'CocoaPods', categories: ['UI'], githubRepo: 'SnapKit/SnapKit' },
  { name: 'Kingfisher', language: 'swift', ecosystem: 'CocoaPods', categories: ['Image Loading'], githubRepo: 'onevcat/Kingfisher' },
  { name: 'Realm', language: 'swift', ecosystem: 'CocoaPods', categories: ['Database'], githubRepo: 'realm/realm-swift' },

  // ============= KOTLIN =============
  { name: 'ktor', language: 'kotlin', ecosystem: 'maven', categories: ['Web Frameworks'], githubRepo: 'ktorio/ktor' },
  { name: 'kotlinx.coroutines', language: 'kotlin', ecosystem: 'maven', categories: ['Async Programming'], githubRepo: 'Kotlin/kotlinx.coroutines' },
  { name: 'kotlinx.serialization', language: 'kotlin', ecosystem: 'maven', categories: ['Serialization'], githubRepo: 'Kotlin/kotlinx.serialization' },
  { name: 'exposed', language: 'kotlin', ecosystem: 'maven', categories: ['Database'], githubRepo: 'JetBrains/Exposed' },

  // ============= DART/FLUTTER =============
  { name: 'flutter_bloc', language: 'dart', ecosystem: 'pub.dev', categories: ['State Management'], githubRepo: 'felangel/bloc' },
  { name: 'provider', language: 'dart', ecosystem: 'pub.dev', categories: ['State Management'], githubRepo: 'rrousselGit/provider' },
  { name: 'http', language: 'dart', ecosystem: 'pub.dev', categories: ['Networking'], githubRepo: 'dart-lang/http' },
  { name: 'dio', language: 'dart', ecosystem: 'pub.dev', categories: ['Networking'], githubRepo: 'flutterchina/dio' },
  { name: 'get', language: 'dart', ecosystem: 'pub.dev', categories: ['State Management'], githubRepo: 'jonataslaw/get' },
  { name: 'sqflite', language: 'dart', ecosystem: 'pub.dev', categories: ['Database'], githubRepo: 'tekartik/sqflite' },

  // ============= ELIXIR =============
  { name: 'phoenix', language: 'elixir', ecosystem: 'hex.pm', categories: ['Web Frameworks'], githubRepo: 'phoenixframework/phoenix' },
  { name: 'ecto', language: 'elixir', ecosystem: 'hex.pm', categories: ['Database'], githubRepo: 'elixir-ecto/ecto' },
  { name: 'absinthe', language: 'elixir', ecosystem: 'hex.pm', categories: ['GraphQL'], githubRepo: 'absinthe-graphql/absinthe' },
  { name: 'credo', language: 'elixir', ecosystem: 'hex.pm', categories: ['Code Quality'], githubRepo: 'rrrene/credo' },

  // ============= HASKELL =============
  { name: 'aeson', language: 'haskell', ecosystem: 'Hackage', categories: ['JSON'], githubRepo: 'haskell/aeson' },
  { name: 'yesod', language: 'haskell', ecosystem: 'Hackage', categories: ['Web Frameworks'], githubRepo: 'yesodweb/yesod' },
  { name: 'servant', language: 'haskell', ecosystem: 'Hackage', categories: ['Web Frameworks'], githubRepo: 'haskell-servant/servant' },
  { name: 'lens', language: 'haskell', ecosystem: 'Hackage', categories: ['Functional'], githubRepo: 'ekmett/lens' },

  // ============= SCALA =============
  { name: 'akka', language: 'scala', ecosystem: 'maven', categories: ['Concurrency'], githubRepo: 'akka/akka' },
  { name: 'play', language: 'scala', ecosystem: 'maven', categories: ['Web Frameworks'], githubRepo: 'playframework/playframework' },
  { name: 'spray', language: 'scala', ecosystem: 'maven', categories: ['Web Frameworks'], githubRepo: 'spray/spray' },
  { name: 'cats', language: 'scala', ecosystem: 'maven', categories: ['Functional'], githubRepo: 'typelevel/cats' },

  // ============= C++ =============
  { name: 'boost', language: 'cpp', ecosystem: 'vcpkg', categories: ['Utilities'], githubRepo: 'boostorg/boost' },
  { name: 'fmt', language: 'cpp', ecosystem: 'vcpkg', categories: ['Formatting'], githubRepo: 'fmtlib/fmt' },
  { name: 'spdlog', language: 'cpp', ecosystem: 'vcpkg', categories: ['Logging'], githubRepo: 'gabime/spdlog' },
  { name: 'catch2', language: 'cpp', ecosystem: 'vcpkg', categories: ['Testing'], githubRepo: 'catchorg/Catch2' },
  { name: 'nlohmann/json', language: 'cpp', ecosystem: 'vcpkg', categories: ['JSON'], githubRepo: 'nlohmann/json' },

  // ============= R =============
  { name: 'ggplot2', language: 'r', ecosystem: 'CRAN', categories: ['Visualization'], githubRepo: 'tidyverse/ggplot2' },
  { name: 'dplyr', language: 'r', ecosystem: 'CRAN', categories: ['Data Manipulation'], githubRepo: 'tidyverse/dplyr' },
  { name: 'shiny', language: 'r', ecosystem: 'CRAN', categories: ['Web Apps'], githubRepo: 'rstudio/shiny' },
  { name: 'tidyr', language: 'r', ecosystem: 'CRAN', categories: ['Data Wrangling'], githubRepo: 'tidyverse/tidyr' },

  // ============= JULIA =============
  { name: 'Flux', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Machine Learning'], githubRepo: 'FluxML/Flux.jl' },
  { name: 'Plots', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Visualization'], githubRepo: 'JuliaPlots/Plots.jl' },
  { name: 'DataFrames', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Data Science'], githubRepo: 'JuliaData/DataFrames.jl' },
  { name: 'JuMP', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Optimization'], githubRepo: 'jump-dev/JuMP.jl' },
];

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;
  const failedPackages: string[] = [];
  const skippedPackages: string[] = [];

  for (const pkg of packagesToImport) {
    const success = await importPackage(pkg);
    if (success) {
      successCount++;
    } else {
      // Check if package was skipped (already exists) or failed
      const existing = await prisma.package.findUnique({
        where: { slug: pkg.name.toLowerCase() },
      });
      if (existing) {
        skipCount++;
        skippedPackages.push(`${pkg.name} (${pkg.language})`);
      } else {
        failCount++;
        failedPackages.push(`${pkg.name} (${pkg.language})`);
      }
    }
    
    // Rate limiting: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ Import Complete!\n');
  console.log(`✅ Successfully imported: ${successCount} packages`);
  console.log(`⏭️  Skipped (already exist): ${skipCount} packages`);
  console.log(`❌ Failed: ${failCount} packages\n`);
    if (skipCount > 0) {
    console.log('⏭️  Skipped packages (already in database):');
    skippedPackages.slice(0, 5).forEach(pkg => console.log(`   - ${pkg}`));
    if (skippedPackages.length > 5) {
      console.log(`   ... and ${skippedPackages.length - 5} more\n`);
    } else {
      console.log('');
    }
  }
    if (failCount > 0) {
    console.log('� Failed packages:');
    failedPackages.slice(0, 10).forEach(pkg => console.log(`   - ${pkg}`));
    if (failedPackages.length > 10) {
      console.log(`   ... and ${failedPackages.length - 10} more\n`);
    } else {
      console.log('');
    }
    console.log('�💡 Common reasons for failures:');
    console.log('   - GitHub repository not found (check repo name)');
    console.log('   - Package name mismatch with registry');
    console.log('   - API rate limiting (add GITHUB_TOKEN)');
    console.log('   - Package already exists in database\n');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Show total packages by language
  const pythonCount = await prisma.package.count({ where: { language: 'PYTHON' } });
  const nodejsCount = await prisma.package.count({ where: { language: 'NODEJS' } });
  const rustCount = await prisma.package.count({ where: { language: 'RUST' } });
  const goCount = await prisma.package.count({ where: { language: 'GO' } });
  const javaCount = await prisma.package.count({ where: { language: 'JAVA' } });
  const csharpCount = await prisma.package.count({ where: { language: 'CSHARP' } });
  const rubyCount = await prisma.package.count({ where: { language: 'RUBY' } });
  const phpCount = await prisma.package.count({ where: { language: 'PHP' } });
  const swiftCount = await prisma.package.count({ where: { language: 'SWIFT' } });
  const kotlinCount = await prisma.package.count({ where: { language: 'KOTLIN' } });
  const dartCount = await prisma.package.count({ where: { language: 'DART' } });
  const elixirCount = await prisma.package.count({ where: { language: 'ELIXIR' } });
  const haskellCount = await prisma.package.count({ where: { language: 'HASKELL' } });
  const scalaCount = await prisma.package.count({ where: { language: 'SCALA' } });
  const cppCount = await prisma.package.count({ where: { language: 'CPP' } });
  const rCount = await prisma.package.count({ where: { language: 'R' } });
  const juliaCount = await prisma.package.count({ where: { language: 'JULIA' } });
  const total = await prisma.package.count();

  console.log('📊 Database Summary:');
  console.log(`   🐍 Python:   ${pythonCount} packages`);
  console.log(`   📦 Node.js:  ${nodejsCount} packages`);
  console.log(`   🦀 Rust:     ${rustCount} packages`);
  console.log(`   🔷 Go:       ${goCount} packages`);
  console.log(`   ☕ Java:     ${javaCount} packages`);
  console.log(`   💜 C#:       ${csharpCount} packages`);
  console.log(`   💎 Ruby:     ${rubyCount} packages`);
  console.log(`   🐘 PHP:      ${phpCount} packages`);
  console.log(`   🔶 Swift:    ${swiftCount} packages`);
  console.log(`   🟣 Kotlin:   ${kotlinCount} packages`);
  console.log(`   🎯 Dart:     ${dartCount} packages`);
  console.log(`   💧 Elixir:   ${elixirCount} packages`);
  console.log(`   🎩 Haskell:  ${haskellCount} packages`);
  console.log(`   🔴 Scala:    ${scalaCount} packages`);
  console.log(`   ⚡ C++:      ${cppCount} packages`);
  console.log(`   📊 R:        ${rCount} packages`);
  console.log(`   🟢 Julia:    ${juliaCount} packages`);
  console.log(`   ─────────────────────────────`);
  console.log(`   📦 Total:    ${total} packages\n`);
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
