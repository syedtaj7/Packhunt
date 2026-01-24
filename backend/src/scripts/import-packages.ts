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
    // 1. Check if package already exists (FAST CHECK FIRST!)
    const existing = await prisma.package.findUnique({
      where: { slug: input.name.toLowerCase() },
    });

    if (existing) {
      console.log('  ⚠️  Package already exists, skipping...');
      return false;
    }

    // 2. Find or use provided GitHub repo
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

    // 3. Fetch GitHub data
    console.log('  🔍 Fetching GitHub data...');
    const githubData = await fetchGitHubData(githubRepo);
    if (!githubData) {
      console.log('  ❌ Failed to fetch GitHub data');
      return false;
    }
    console.log(`  ✓ Stars: ${githubData.stars.toLocaleString()}`);

    // 4. Fetch registry data
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
  
  // Authentication & Security
  { name: 'pyjwt', language: 'python', ecosystem: 'pypi', categories: ['Authentication'], githubRepo: 'jpadilla/pyjwt' },
  { name: 'cryptography', language: 'python', ecosystem: 'pypi', categories: ['Security'], githubRepo: 'pyca/cryptography' },
  { name: 'bcrypt', language: 'python', ecosystem: 'pypi', categories: ['Security'], githubRepo: 'pyca/bcrypt' },
  
  // API & Serialization
  { name: 'pydantic', language: 'python', ecosystem: 'pypi', categories: ['Validation'], githubRepo: 'pydantic/pydantic' },
  { name: 'marshmallow', language: 'python', ecosystem: 'pypi', categories: ['Validation'], githubRepo: 'marshmallow-code/marshmallow' },
  { name: 'pyyaml', language: 'python', ecosystem: 'pypi', categories: ['Configuration'], githubRepo: 'yaml/pyyaml' },
  { name: 'click', language: 'python', ecosystem: 'pypi', categories: ['CLI Tools'], githubRepo: 'pallets/click' },
  { name: 'typer', language: 'python', ecosystem: 'pypi', categories: ['CLI Tools'], githubRepo: 'tiangolo/typer' },
  
  // Logging & Monitoring
  { name: 'loguru', language: 'python', ecosystem: 'pypi', categories: ['Logging'], githubRepo: 'Delgan/loguru' },
  { name: 'sentry-sdk', language: 'python', ecosystem: 'pypi', categories: ['Monitoring'], githubRepo: 'getsentry/sentry-python' },
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
  
  // HTTP Clients & APIs
  { name: 'axios', language: 'nodejs', ecosystem: 'npm', categories: ['HTTP Client'], githubRepo: 'axios/axios' },
  { name: 'node-fetch', language: 'nodejs', ecosystem: 'npm', categories: ['HTTP Client'], githubRepo: 'node-fetch/node-fetch' },
  { name: 'got', language: 'nodejs', ecosystem: 'npm', categories: ['HTTP Client'], githubRepo: 'sindresorhus/got' },
  { name: 'superagent', language: 'nodejs', ecosystem: 'npm', categories: ['HTTP Client'], githubRepo: 'ladjs/superagent' },
  
  // Utilities
  { name: 'lodash', language: 'nodejs', ecosystem: 'npm', categories: ['Utilities'], githubRepo: 'lodash/lodash' },
  { name: 'dayjs', language: 'nodejs', ecosystem: 'npm', categories: ['Utilities'], githubRepo: 'iamkun/dayjs' },
  { name: 'date-fns', language: 'nodejs', ecosystem: 'npm', categories: ['Utilities'], githubRepo: 'date-fns/date-fns' },
  { name: 'uuid', language: 'nodejs', ecosystem: 'npm', categories: ['Utilities'], githubRepo: 'uuidjs/uuid' },
  { name: 'nanoid', language: 'nodejs', ecosystem: 'npm', categories: ['Utilities'], githubRepo: 'ai/nanoid' },

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
  
  // HTTP Clients
  { name: 'reqwest', language: 'rust', ecosystem: 'crates.io', categories: ['HTTP Client'], githubRepo: 'seanmonstar/reqwest' },
  { name: 'ureq', language: 'rust', ecosystem: 'crates.io', categories: ['HTTP Client'], githubRepo: 'algesten/ureq' },
  
  // Utilities
  { name: 'rayon', language: 'rust', ecosystem: 'crates.io', categories: ['Concurrency'], githubRepo: 'rayon-rs/rayon' },
  { name: 'chrono', language: 'rust', ecosystem: 'crates.io', categories: ['Utilities'], githubRepo: 'chronotope/chrono' },
  { name: 'uuid', language: 'rust', ecosystem: 'crates.io', categories: ['Utilities'], githubRepo: 'uuid-rs/uuid' },
  { name: 'regex', language: 'rust', ecosystem: 'crates.io', categories: ['Utilities'], githubRepo: 'rust-lang/regex' },
  
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
  { name: 'junit', language: 'java', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'junit-team/junit5' },
  { name: 'mockito', language: 'java', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'mockito/mockito' },
  { name: 'jackson', language: 'java', ecosystem: 'maven', categories: ['Serialization'], githubRepo: 'FasterXML/jackson' },
  { name: 'lombok', language: 'java', ecosystem: 'maven', categories: ['Utilities'], githubRepo: 'projectlombok/lombok' },
  { name: 'guava', language: 'java', ecosystem: 'maven', categories: ['Utilities'], githubRepo: 'google/guava' },
  { name: 'log4j', language: 'java', ecosystem: 'maven', categories: ['Logging'], githubRepo: 'apache/logging-log4j2' },
  { name: 'slf4j', language: 'java', ecosystem: 'maven', categories: ['Logging'], githubRepo: 'qos-ch/slf4j' },
  { name: 'apache-commons', language: 'java', ecosystem: 'maven', categories: ['Utilities'], githubRepo: 'apache/commons-lang' },
  { name: 'quarkus', language: 'java', ecosystem: 'maven', categories: ['Web Frameworks'], githubRepo: 'quarkusio/quarkus' },
  { name: 'micronaut', language: 'java', ecosystem: 'maven', categories: ['Web Frameworks'], githubRepo: 'micronaut-projects/micronaut-core' },

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
  { name: 'nokogiri', language: 'ruby', ecosystem: 'rubygems', categories: ['XML Parsing'], githubRepo: 'sparklemotion/nokogiri' },
  { name: 'faraday', language: 'ruby', ecosystem: 'rubygems', categories: ['HTTP Client'], githubRepo: 'lostisland/faraday' },
  { name: 'rubocop', language: 'ruby', ecosystem: 'rubygems', categories: ['Code Quality'], githubRepo: 'rubocop/rubocop' },

  // ============= PHP =============
  { name: 'laravel', language: 'php', ecosystem: 'packagist', categories: ['Web Frameworks'], githubRepo: 'laravel/laravel' },
  { name: 'symfony', language: 'php', ecosystem: 'packagist', categories: ['Web Frameworks'], githubRepo: 'symfony/symfony' },
  { name: 'composer', language: 'php', ecosystem: 'packagist', categories: ['Package Manager'], githubRepo: 'composer/composer' },
  { name: 'phpunit', language: 'php', ecosystem: 'packagist', categories: ['Testing'], githubRepo: 'sebastianbergmann/phpunit' },
  { name: 'guzzle', language: 'php', ecosystem: 'packagist', categories: ['HTTP Client'], githubRepo: 'guzzle/guzzle' },
  { name: 'monolog', language: 'php', ecosystem: 'packagist', categories: ['Logging'], githubRepo: 'Seldaek/monolog' },
  { name: 'doctrine', language: 'php', ecosystem: 'packagist', categories: ['Database'], githubRepo: 'doctrine/orm' },
  { name: 'psr-log', language: 'php', ecosystem: 'packagist', categories: ['Logging'], githubRepo: 'php-fig/log' },
  { name: 'phpstan', language: 'php', ecosystem: 'packagist', categories: ['Code Quality'], githubRepo: 'phpstan/phpstan' },
  { name: 'twig', language: 'php', ecosystem: 'packagist', categories: ['Templates'], githubRepo: 'twigphp/Twig' },

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
  { name: 'DifferentialEquations', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Scientific'], githubRepo: 'SciML/DifferentialEquations.jl' },
  { name: 'Distributions', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Statistics'], githubRepo: 'JuliaStats/Distributions.jl' },
  { name: 'MLJ', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Machine Learning'], githubRepo: 'alan-turing-institute/MLJ.jl' },
  { name: 'Turing', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Machine Learning'], githubRepo: 'TuringLang/Turing.jl' },
  { name: 'Makie', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Visualization'], githubRepo: 'MakieOrg/Makie.jl' },
  { name: 'Genie', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Web Frameworks'], githubRepo: 'GenieFramework/Genie.jl' },
  { name: 'HTTP', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Web Development'], githubRepo: 'JuliaWeb/HTTP.jl' },
  { name: 'JSON', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['JSON'], githubRepo: 'JuliaIO/JSON.jl' },
  { name: 'CSV', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Data Science'], githubRepo: 'JuliaData/CSV.jl' },
  { name: 'Query', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Data Science'], githubRepo: 'queryverse/Query.jl' },
  { name: 'StaticArrays', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Performance'], githubRepo: 'JuliaArrays/StaticArrays.jl' },
  { name: 'Revise', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Development'], githubRepo: 'timholy/Revise.jl' },
  { name: 'BenchmarkTools', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Performance'], githubRepo: 'JuliaCI/BenchmarkTools.jl' },
  { name: 'Test', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Testing'], githubRepo: 'JuliaLang/julia' },
  { name: 'Optim', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Optimization'], githubRepo: 'JuliaOpt/Optim.jl' },
  { name: 'ForwardDiff', language: 'julia', ecosystem: 'JuliaRegistries', categories: ['Automatic Differentiation'], githubRepo: 'JuliaDiff/ForwardDiff.jl' },

  // ============= MORE PYTHON =============
  { name: 'poetry', language: 'python', ecosystem: 'pypi', categories: ['Package Management'], githubRepo: 'python-poetry/poetry' },
  { name: 'pipenv', language: 'python', ecosystem: 'pypi', categories: ['Package Management'], githubRepo: 'pypa/pipenv' },
  { name: 'celery', language: 'python', ecosystem: 'pypi', categories: ['Task Queue'], githubRepo: 'celery/celery' },
  { name: 'alembic', language: 'python', ecosystem: 'pypi', categories: ['Database'], githubRepo: 'sqlalchemy/alembic' },
  { name: 'graphene', language: 'python', ecosystem: 'pypi', categories: ['GraphQL'], githubRepo: 'graphql-python/graphene' },
  { name: 'strawberry-graphql', language: 'python', ecosystem: 'pypi', categories: ['GraphQL'], githubRepo: 'strawberry-graphql/strawberry' },
  { name: 'uvicorn', language: 'python', ecosystem: 'pypi', categories: ['Web Servers'], githubRepo: 'encode/uvicorn' },
  { name: 'gunicorn', language: 'python', ecosystem: 'pypi', categories: ['Web Servers'], githubRepo: 'benoitc/gunicorn' },
  { name: 'tornado', language: 'python', ecosystem: 'pypi', categories: ['Web Frameworks'], githubRepo: 'tornadoweb/tornado' },
  { name: 'bottle', language: 'python', ecosystem: 'pypi', categories: ['Web Frameworks'], githubRepo: 'bottlepy/bottle' },
  { name: 'cherrypy', language: 'python', ecosystem: 'pypi', categories: ['Web Frameworks'], githubRepo: 'cherrypy/cherrypy' },
  { name: 'falcon', language: 'python', ecosystem: 'pypi', categories: ['Web Frameworks'], githubRepo: 'falconry/falcon' },
  { name: 'locust', language: 'python', ecosystem: 'pypi', categories: ['Testing'], githubRepo: 'locustio/locust' },
  { name: 'hypothesis', language: 'python', ecosystem: 'pypi', categories: ['Testing'], githubRepo: 'HypothesisWorks/hypothesis' },
  { name: 'tox', language: 'python', ecosystem: 'pypi', categories: ['Testing'], githubRepo: 'tox-dev/tox' },
  { name: 'coverage', language: 'python', ecosystem: 'pypi', categories: ['Testing'], githubRepo: 'nedbat/coveragepy' },
  { name: 'bandit', language: 'python', ecosystem: 'pypi', categories: ['Security'], githubRepo: 'PyCQA/bandit' },
  { name: 'safety', language: 'python', ecosystem: 'pypi', categories: ['Security'], githubRepo: 'pyupio/safety' },
  { name: 'pyinstaller', language: 'python', ecosystem: 'pypi', categories: ['Build Tools'], githubRepo: 'pyinstaller/pyinstaller' },
  { name: 'py2exe', language: 'python', ecosystem: 'pypi', categories: ['Build Tools'], githubRepo: 'py2exe/py2exe' },
  { name: 'cx_Freeze', language: 'python', ecosystem: 'pypi', categories: ['Build Tools'], githubRepo: 'marcelotduarte/cx_Freeze' },
  { name: 'nuitka', language: 'python', ecosystem: 'pypi', categories: ['Build Tools'], githubRepo: 'Nuitka/Nuitka' },
  { name: 'spacy', language: 'python', ecosystem: 'pypi', categories: ['NLP'], githubRepo: 'explosion/spaCy' },
  { name: 'nltk', language: 'python', ecosystem: 'pypi', categories: ['NLP'], githubRepo: 'nltk/nltk' },
  { name: 'gensim', language: 'python', ecosystem: 'pypi', categories: ['NLP'], githubRepo: 'RaRe-Technologies/gensim' },
  { name: 'textblob', language: 'python', ecosystem: 'pypi', categories: ['NLP'], githubRepo: 'sloria/TextBlob' },
  { name: 'flair', language: 'python', ecosystem: 'pypi', categories: ['NLP'], githubRepo: 'flairNLP/flair' },
  { name: 'xgboost', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'dmlc/xgboost' },
  { name: 'lightgbm', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'microsoft/LightGBM' },
  { name: 'catboost', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'catboost/catboost' },
  { name: 'optuna', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'optuna/optuna' },
  { name: 'mlflow', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'mlflow/mlflow' },
  { name: 'wandb', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'wandb/wandb' },
  { name: 'ray', language: 'python', ecosystem: 'pypi', categories: ['Machine Learning'], githubRepo: 'ray-project/ray' },
  { name: 'airflow', language: 'python', ecosystem: 'pypi', categories: ['Workflow'], githubRepo: 'apache/airflow' },
  { name: 'prefect', language: 'python', ecosystem: 'pypi', categories: ['Workflow'], githubRepo: 'PrefectHQ/prefect' },
  { name: 'luigi', language: 'python', ecosystem: 'pypi', categories: ['Workflow'], githubRepo: 'spotify/luigi' },
  { name: 'dash', language: 'python', ecosystem: 'pypi', categories: ['Visualization'], githubRepo: 'plotly/dash' },
  { name: 'altair', language: 'python', ecosystem: 'pypi', categories: ['Visualization'], githubRepo: 'altair-viz/altair' },
  { name: 'holoviews', language: 'python', ecosystem: 'pypi', categories: ['Visualization'], githubRepo: 'holoviz/holoviews' },
  { name: 'pyarrow', language: 'python', ecosystem: 'pypi', categories: ['Data Science'], githubRepo: 'apache/arrow' },
  { name: 'parquet', language: 'python', ecosystem: 'pypi', categories: ['Data Science'], githubRepo: 'apache/parquet-mr' },
  { name: 'openpyxl', language: 'python', ecosystem: 'pypi', categories: ['Data Science'], githubRepo: 'theorchard/openpyxl' },
  { name: 'xlrd', language: 'python', ecosystem: 'pypi', categories: ['Data Science'], githubRepo: 'python-excel/xlrd' },
  { name: 'tabulate', language: 'python', ecosystem: 'pypi', categories: ['Data Science'], githubRepo: 'astanin/python-tabulate' },
  { name: 'arrow', language: 'python', ecosystem: 'pypi', categories: ['Date/Time'], githubRepo: 'arrow-py/arrow' },
  { name: 'pendulum', language: 'python', ecosystem: 'pypi', categories: ['Date/Time'], githubRepo: 'sdispater/pendulum' },
  { name: 'python-dateutil', language: 'python', ecosystem: 'pypi', categories: ['Date/Time'], githubRepo: 'dateutil/dateutil' },
  { name: 'pytz', language: 'python', ecosystem: 'pypi', categories: ['Date/Time'], githubRepo: 'stub42/pytz' },
  { name: 'faker', language: 'python', ecosystem: 'pypi', categories: ['Testing'], githubRepo: 'joke2k/faker' },
  { name: 'factory-boy', language: 'python', ecosystem: 'pypi', categories: ['Testing'], githubRepo: 'FactoryBoy/factory_boy' },
  { name: 'responses', language: 'python', ecosystem: 'pypi', categories: ['Testing'], githubRepo: 'getsentry/responses' },
  { name: 'freezegun', language: 'python', ecosystem: 'pypi', categories: ['Testing'], githubRepo: 'spulec/freezegun' },
  { name: 'mimesis', language: 'python', ecosystem: 'pypi', categories: ['Testing'], githubRepo: 'lk-geimfari/mimesis' },
  { name: 'pillow-simd', language: 'python', ecosystem: 'pypi', categories: ['Image Processing'], githubRepo: 'uploadcare/pillow-simd' },
  { name: 'imageio', language: 'python', ecosystem: 'pypi', categories: ['Image Processing'], githubRepo: 'imageio/imageio' },
  { name: 'scikit-image', language: 'python', ecosystem: 'pypi', categories: ['Image Processing'], githubRepo: 'scikit-image/scikit-image' },
  { name: 'albumentations', language: 'python', ecosystem: 'pypi', categories: ['Image Processing'], githubRepo: 'albumentations-team/albumentations' },
  { name: 'imgaug', language: 'python', ecosystem: 'pypi', categories: ['Image Processing'], githubRepo: 'aleju/imgaug' },

  // ============= MORE NODE.JS =============
  { name: 'express-validator', language: 'nodejs', ecosystem: 'npm', categories: ['Validation'], githubRepo: 'express-validator/express-validator' },
  { name: 'cors', language: 'nodejs', ecosystem: 'npm', categories: ['Web Development'], githubRepo: 'expressjs/cors' },
  { name: 'body-parser', language: 'nodejs', ecosystem: 'npm', categories: ['Web Development'], githubRepo: 'expressjs/body-parser' },
  { name: 'cookie-parser', language: 'nodejs', ecosystem: 'npm', categories: ['Web Development'], githubRepo: 'expressjs/cookie-parser' },
  { name: 'multer', language: 'nodejs', ecosystem: 'npm', categories: ['File Upload'], githubRepo: 'expressjs/multer' },
  { name: 'sharp', language: 'nodejs', ecosystem: 'npm', categories: ['Image Processing'], githubRepo: 'lovell/sharp' },
  { name: 'jimp', language: 'nodejs', ecosystem: 'npm', categories: ['Image Processing'], githubRepo: 'jimp-dev/jimp' },
  { name: 'pdfkit', language: 'nodejs', ecosystem: 'npm', categories: ['PDF'], githubRepo: 'foliojs/pdfkit' },
  { name: 'puppeteer', language: 'nodejs', ecosystem: 'npm', categories: ['Automation'], githubRepo: 'puppeteer/puppeteer' },
  { name: 'cheerio', language: 'nodejs', ecosystem: 'npm', categories: ['Web Scraping'], githubRepo: 'cheeriojs/cheerio' },
  { name: 'node-cron', language: 'nodejs', ecosystem: 'npm', categories: ['Scheduling'], githubRepo: 'node-cron/node-cron' },
  { name: 'bull', language: 'nodejs', ecosystem: 'npm', categories: ['Task Queue'], githubRepo: 'OptimalBits/bull' },
  { name: 'agenda', language: 'nodejs', ecosystem: 'npm', categories: ['Task Queue'], githubRepo: 'agenda/agenda' },
  { name: 'dotenv', language: 'nodejs', ecosystem: 'npm', categories: ['Configuration'], githubRepo: 'motdotla/dotenv' },
  { name: 'config', language: 'nodejs', ecosystem: 'npm', categories: ['Configuration'], githubRepo: 'node-config/node-config' },
  { name: 'winston', language: 'nodejs', ecosystem: 'npm', categories: ['Logging'], githubRepo: 'winstonjs/winston' },
  { name: 'pino', language: 'nodejs', ecosystem: 'npm', categories: ['Logging'], githubRepo: 'pinojs/pino' },
  { name: 'morgan', language: 'nodejs', ecosystem: 'npm', categories: ['Logging'], githubRepo: 'expressjs/morgan' },
  { name: 'bunyan', language: 'nodejs', ecosystem: 'npm', categories: ['Logging'], githubRepo: 'trentm/node-bunyan' },
  { name: 'debug', language: 'nodejs', ecosystem: 'npm', categories: ['Debugging'], githubRepo: 'debug-js/debug' },
  { name: 'nodemon', language: 'nodejs', ecosystem: 'npm', categories: ['Development'], githubRepo: 'remy/nodemon' },
  { name: 'pm2', language: 'nodejs', ecosystem: 'npm', categories: ['Process Management'], githubRepo: 'Unitech/pm2' },
  { name: 'concurrently', language: 'nodejs', ecosystem: 'npm', categories: ['Development'], githubRepo: 'open-cli-tools/concurrently' },
  { name: 'chalk', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'chalk/chalk' },
  { name: 'inquirer', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'SBoudrias/Inquirer.js' },
  { name: 'commander', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'tj/commander.js' },
  { name: 'yargs', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'yargs/yargs' },
  { name: 'ora', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'sindresorhus/ora' },
  { name: 'progress', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'visionmedia/node-progress' },
  { name: 'boxen', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'sindresorhus/boxen' },
  { name: 'figlet', language: 'nodejs', ecosystem: 'npm', categories: ['CLI Tools'], githubRepo: 'patorjk/figlet.js' },
  { name: 'moment', language: 'nodejs', ecosystem: 'npm', categories: ['Date/Time'], githubRepo: 'moment/moment' },
  { name: 'luxon', language: 'nodejs', ecosystem: 'npm', categories: ['Date/Time'], githubRepo: 'moment/luxon' },
  { name: 'date-fns-tz', language: 'nodejs', ecosystem: 'npm', categories: ['Date/Time'], githubRepo: 'marnusw/date-fns-tz' },
  { name: 'ms', language: 'nodejs', ecosystem: 'npm', categories: ['Utilities'], githubRepo: 'vercel/ms' },
  { name: 'validator', language: 'nodejs', ecosystem: 'npm', categories: ['Validation'], githubRepo: 'validatorjs/validator.js' },
  { name: 'ajv', language: 'nodejs', ecosystem: 'npm', categories: ['Validation'], githubRepo: 'ajv-validator/ajv' },
  { name: 'jsonwebtoken', language: 'nodejs', ecosystem: 'npm', categories: ['Authentication'], githubRepo: 'auth0/node-jsonwebtoken' },
  { name: 'express-rate-limit', language: 'nodejs', ecosystem: 'npm', categories: ['Security'], githubRepo: 'express-rate-limit/express-rate-limit' },
  { name: 'rate-limiter-flexible', language: 'nodejs', ecosystem: 'npm', categories: ['Security'], githubRepo: 'animir/node-rate-limiter-flexible' },
  { name: 'joi-to-swagger', language: 'nodejs', ecosystem: 'npm', categories: ['API Documentation'], githubRepo: 'Twipped/joi-to-swagger' },
  { name: 'swagger-jsdoc', language: 'nodejs', ecosystem: 'npm', categories: ['API Documentation'], githubRepo: 'Surnet/swagger-jsdoc' },
  { name: 'express-openapi', language: 'nodejs', ecosystem: 'npm', categories: ['API Documentation'], githubRepo: 'kogosoftwarellc/open-api' },
  { name: 'supertest', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'ladjs/supertest' },
  { name: 'ava', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'avajs/ava' },
  { name: 'tap', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'tapjs/node-tap' },
  { name: 'chai', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'chaijs/chai' },
  { name: 'sinon', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'sinonjs/sinon' },
  { name: 'nock', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'nock/nock' },
  { name: 'mock-fs', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'tschaub/mock-fs' },
  { name: 'faker', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'faker-js/faker' },
  { name: 'casual', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'boo1ean/casual' },
  { name: 'nyc', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'istanbuljs/nyc' },
  { name: 'c8', language: 'nodejs', ecosystem: 'npm', categories: ['Testing'], githubRepo: 'bcoe/c8' },
  { name: 'eslint-config-airbnb', language: 'nodejs', ecosystem: 'npm', categories: ['Linting'], githubRepo: 'airbnb/javascript' },
  { name: 'eslint-plugin-react', language: 'nodejs', ecosystem: 'npm', categories: ['Linting'], githubRepo: 'jsx-eslint/eslint-plugin-react' },
  { name: 'standard', language: 'nodejs', ecosystem: 'npm', categories: ['Linting'], githubRepo: 'standard/standard' },
  { name: 'husky', language: 'nodejs', ecosystem: 'npm', categories: ['Git Hooks'], githubRepo: 'typicode/husky' },
  { name: 'lint-staged', language: 'nodejs', ecosystem: 'npm', categories: ['Git Hooks'], githubRepo: 'lint-staged/lint-staged' },
  { name: 'commitlint', language: 'nodejs', ecosystem: 'npm', categories: ['Git Tools'], githubRepo: 'conventional-changelog/commitlint' },
  { name: 'semantic-release', language: 'nodejs', ecosystem: 'npm', categories: ['Release Management'], githubRepo: 'semantic-release/semantic-release' },
  { name: 'release-it', language: 'nodejs', ecosystem: 'npm', categories: ['Release Management'], githubRepo: 'release-it/release-it' },
  { name: 'np', language: 'nodejs', ecosystem: 'npm', categories: ['Release Management'], githubRepo: 'sindresorhus/np' },
  { name: 'cross-env', language: 'nodejs', ecosystem: 'npm', categories: ['Development'], githubRepo: 'kentcdodds/cross-env' },
  { name: 'rimraf', language: 'nodejs', ecosystem: 'npm', categories: ['Utilities'], githubRepo: 'isaacs/rimraf' },
  { name: 'fs-extra', language: 'nodejs', ecosystem: 'npm', categories: ['File System'], githubRepo: 'jprichardson/node-fs-extra' },
  { name: 'glob', language: 'nodejs', ecosystem: 'npm', categories: ['File System'], githubRepo: 'isaacs/node-glob' },
  { name: 'chokidar', language: 'nodejs', ecosystem: 'npm', categories: ['File Watching'], githubRepo: 'paulmillr/chokidar' },
  { name: 'minimatch', language: 'nodejs', ecosystem: 'npm', categories: ['Pattern Matching'], githubRepo: 'isaacs/minimatch' },

  // ============= MORE RUST =============
  { name: 'cargo-edit', language: 'rust', ecosystem: 'crates.io', categories: ['Cargo Tools'], githubRepo: 'killercup/cargo-edit' },
  { name: 'cargo-watch', language: 'rust', ecosystem: 'crates.io', categories: ['Development'], githubRepo: 'watchexec/cargo-watch' },
  { name: 'cargo-make', language: 'rust', ecosystem: 'crates.io', categories: ['Build Tools'], githubRepo: 'sagiegurari/cargo-make' },
  { name: 'cargo-outdated', language: 'rust', ecosystem: 'crates.io', categories: ['Cargo Tools'], githubRepo: 'kbknapp/cargo-outdated' },
  { name: 'cargo-audit', language: 'rust', ecosystem: 'crates.io', categories: ['Security'], githubRepo: 'RustSec/rustsec' },
  { name: 'cargo-deny', language: 'rust', ecosystem: 'crates.io', categories: ['Security'], githubRepo: 'EmbarkStudios/cargo-deny' },
  { name: 'criterion', language: 'rust', ecosystem: 'crates.io', categories: ['Benchmarking'], githubRepo: 'bheisler/criterion.rs' },
  { name: 'quickcheck', language: 'rust', ecosystem: 'crates.io', categories: ['Testing'], githubRepo: 'BurntSushi/quickcheck' },
  { name: 'pretty_assertions', language: 'rust', ecosystem: 'crates.io', categories: ['Testing'], githubRepo: 'rust-pretty-assertions/rust-pretty-assertions' },
  { name: 'insta', language: 'rust', ecosystem: 'crates.io', categories: ['Testing'], githubRepo: 'mitsuhiko/insta' },
  { name: 'tarpaulin', language: 'rust', ecosystem: 'crates.io', categories: ['Testing'], githubRepo: 'xd009642/tarpaulin' },
  { name: 'indicatif', language: 'rust', ecosystem: 'crates.io', categories: ['CLI Tools'], githubRepo: 'console-rs/indicatif' },
  { name: 'dialoguer', language: 'rust', ecosystem: 'crates.io', categories: ['CLI Tools'], githubRepo: 'console-rs/dialoguer' },
  { name: 'colored', language: 'rust', ecosystem: 'crates.io', categories: ['CLI Tools'], githubRepo: 'colored-rs/colored' },
  { name: 'termcolor', language: 'rust', ecosystem: 'crates.io', categories: ['CLI Tools'], githubRepo: 'BurntSushi/termcolor' },
  { name: 'crossterm', language: 'rust', ecosystem: 'crates.io', categories: ['CLI Tools'], githubRepo: 'crossterm-rs/crossterm' },
  { name: 'ratatui', language: 'rust', ecosystem: 'crates.io', categories: ['TUI'], githubRepo: 'ratatui-org/ratatui' },
  { name: 'tui-rs', language: 'rust', ecosystem: 'crates.io', categories: ['TUI'], githubRepo: 'fdehau/tui-rs' },
  { name: 'nom', language: 'rust', ecosystem: 'crates.io', categories: ['Parsing'], githubRepo: 'rust-bakery/nom' },
  { name: 'pest', language: 'rust', ecosystem: 'crates.io', categories: ['Parsing'], githubRepo: 'pest-parser/pest' },
  { name: 'lalrpop', language: 'rust', ecosystem: 'crates.io', categories: ['Parsing'], githubRepo: 'lalrpop/lalrpop' },
  { name: 'combine', language: 'rust', ecosystem: 'crates.io', categories: ['Parsing'], githubRepo: 'Marwes/combine' },
  { name: 'toml', language: 'rust', ecosystem: 'crates.io', categories: ['Configuration'], githubRepo: 'toml-rs/toml' },
  { name: 'config-rs', language: 'rust', ecosystem: 'crates.io', categories: ['Configuration'], githubRepo: 'mehcode/config-rs' },
  { name: 'figment', language: 'rust', ecosystem: 'crates.io', categories: ['Configuration'], githubRepo: 'SergioBenitez/Figment' },
  { name: 'bytes', language: 'rust', ecosystem: 'crates.io', categories: ['Utilities'], githubRepo: 'tokio-rs/bytes' },
  { name: 'bitflags', language: 'rust', ecosystem: 'crates.io', categories: ['Utilities'], githubRepo: 'bitflags/bitflags' },
  { name: 'once_cell', language: 'rust', ecosystem: 'crates.io', categories: ['Concurrency'], githubRepo: 'matklad/once_cell' },
  { name: 'parking_lot', language: 'rust', ecosystem: 'crates.io', categories: ['Concurrency'], githubRepo: 'Amanieu/parking_lot' },
  { name: 'crossbeam', language: 'rust', ecosystem: 'crates.io', categories: ['Concurrency'], githubRepo: 'crossbeam-rs/crossbeam' },
  { name: 'dashmap', language: 'rust', ecosystem: 'crates.io', categories: ['Data Structures'], githubRepo: 'xacrimon/dashmap' },
  { name: 'ahash', language: 'rust', ecosystem: 'crates.io', categories: ['Hashing'], githubRepo: 'tkaitchuck/aHash' },
  { name: 'image', language: 'rust', ecosystem: 'crates.io', categories: ['Image Processing'], githubRepo: 'image-rs/image' },
  { name: 'imageproc', language: 'rust', ecosystem: 'crates.io', categories: ['Image Processing'], githubRepo: 'image-rs/imageproc' },
  { name: 'rusttype', language: 'rust', ecosystem: 'crates.io', categories: ['Font Rendering'], githubRepo: 'redox-os/rusttype' },
  { name: 'ab_glyph', language: 'rust', ecosystem: 'crates.io', categories: ['Font Rendering'], githubRepo: 'alexheretic/ab-glyph' },
  { name: 'notify', language: 'rust', ecosystem: 'crates.io', categories: ['File System'], githubRepo: 'notify-rs/notify' },
  { name: 'walkdir', language: 'rust', ecosystem: 'crates.io', categories: ['File System'], githubRepo: 'BurntSushi/walkdir' },
  { name: 'ignore', language: 'rust', ecosystem: 'crates.io', categories: ['File System'], githubRepo: 'BurntSushi/ripgrep' },
  { name: 'tempfile', language: 'rust', ecosystem: 'crates.io', categories: ['File System'], githubRepo: 'Stebalien/tempfile' },
  { name: 'dirs', language: 'rust', ecosystem: 'crates.io', categories: ['File System'], githubRepo: 'dirs-dev/dirs-rs' },

  // ============= MORE GO =============
  { name: 'buffalo', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Web Frameworks'], githubRepo: 'gobuffalo/buffalo' },
  { name: 'iris', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Web Frameworks'], githubRepo: 'kataras/iris' },
  { name: 'revel', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Web Frameworks'], githubRepo: 'revel/revel' },
  { name: 'beego', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Web Frameworks'], githubRepo: 'beego/beego' },
  { name: 'gqlgen', language: 'go', ecosystem: 'pkg.go.dev', categories: ['GraphQL'], githubRepo: '99designs/gqlgen' },
  { name: 'graphql-go', language: 'go', ecosystem: 'pkg.go.dev', categories: ['GraphQL'], githubRepo: 'graphql-go/graphql' },
  { name: 'ent', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Database'], githubRepo: 'ent/ent' },
  { name: 'pop', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Database'], githubRepo: 'gobuffalo/pop' },
  { name: 'bun', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Database'], githubRepo: 'uptrace/bun' },
  { name: 'pg', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Database'], githubRepo: 'go-pg/pg' },
  { name: 'mongo-go-driver', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Database'], githubRepo: 'mongodb/mongo-go-driver' },
  { name: 'elastic', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Database'], githubRepo: 'olivere/elastic' },
  { name: 'bleve', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Search'], githubRepo: 'blevesearch/bleve' },
  { name: 'goquery', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Web Scraping'], githubRepo: 'PuerkitoBio/goquery' },
  { name: 'colly', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Web Scraping'], githubRepo: 'gocolly/colly' },
  { name: 'chromedp', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Automation'], githubRepo: 'chromedp/chromedp' },
  { name: 'survey', language: 'go', ecosystem: 'pkg.go.dev', categories: ['CLI Tools'], githubRepo: 'AlecAivazis/survey' },
  { name: 'promptui', language: 'go', ecosystem: 'pkg.go.dev', categories: ['CLI Tools'], githubRepo: 'manifoldco/promptui' },
  { name: 'color', language: 'go', ecosystem: 'pkg.go.dev', categories: ['CLI Tools'], githubRepo: 'fatih/color' },
  { name: 'termenv', language: 'go', ecosystem: 'pkg.go.dev', categories: ['CLI Tools'], githubRepo: 'muesli/termenv' },
  { name: 'lipgloss', language: 'go', ecosystem: 'pkg.go.dev', categories: ['CLI Tools'], githubRepo: 'charmbracelet/lipgloss' },
  { name: 'bubbletea', language: 'go', ecosystem: 'pkg.go.dev', categories: ['TUI'], githubRepo: 'charmbracelet/bubbletea' },
  { name: 'tview', language: 'go', ecosystem: 'pkg.go.dev', categories: ['TUI'], githubRepo: 'rivo/tview' },
  { name: 'termui', language: 'go', ecosystem: 'pkg.go.dev', categories: ['TUI'], githubRepo: 'gizak/termui' },
  { name: 'envconfig', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Configuration'], githubRepo: 'kelseyhightower/envconfig' },
  { name: 'godotenv', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Configuration'], githubRepo: 'joho/godotenv' },
  { name: 'viper', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Configuration'], githubRepo: 'spf13/viper' },
  { name: 'afero', language: 'go', ecosystem: 'pkg.go.dev', categories: ['File System'], githubRepo: 'spf13/afero' },
  { name: 'fsnotify', language: 'go', ecosystem: 'pkg.go.dev', categories: ['File System'], githubRepo: 'fsnotify/fsnotify' },
  { name: 'lo', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Utilities'], githubRepo: 'samber/lo' },
  { name: 'cast', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Type Conversion'], githubRepo: 'spf13/cast' },
  { name: 'now', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Date/Time'], githubRepo: 'jinzhu/now' },
  { name: 'carbon', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Date/Time'], githubRepo: 'golang-module/carbon' },
  { name: 'uuid', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Utilities'], githubRepo: 'google/uuid' },
  { name: 'shortid', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Utilities'], githubRepo: 'teris-io/shortid' },
  { name: 'ulid', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Utilities'], githubRepo: 'oklog/ulid' },
  { name: 'faker', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Testing'], githubRepo: 'go-faker/faker' },
  { name: 'gock', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Testing'], githubRepo: 'h2non/gock' },
  { name: 'gomock', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Testing'], githubRepo: 'uber-go/mock' },
  { name: 'httptest', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Testing'], githubRepo: 'golang/go' },
  { name: 'resty', language: 'go', ecosystem: 'pkg.go.dev', categories: ['HTTP Client'], githubRepo: 'go-resty/resty' },
  { name: 'req', language: 'go', ecosystem: 'pkg.go.dev', categories: ['HTTP Client'], githubRepo: 'imroc/req' },
  { name: 'fasthttp', language: 'go', ecosystem: 'pkg.go.dev', categories: ['Web Frameworks'], githubRepo: 'valyala/fasthttp' },
  { name: 'heimdall', language: 'go', ecosystem: 'pkg.go.dev', categories: ['HTTP Client'], githubRepo: 'gojek/heimdall' },

  // ============= MORE JAVA =============
  { name: 'vertx', language: 'java', ecosystem: 'maven', categories: ['Web Frameworks'], githubRepo: 'eclipse-vertx/vert.x' },
  { name: 'javalin', language: 'java', ecosystem: 'maven', categories: ['Web Frameworks'], githubRepo: 'javalin/javalin' },
  { name: 'sparkjava', language: 'java', ecosystem: 'maven', categories: ['Web Frameworks'], githubRepo: 'perwendel/spark' },
  { name: 'grizzly', language: 'java', ecosystem: 'maven', categories: ['Web Servers'], githubRepo: 'eclipse-ee4j/grizzly' },
  { name: 'netty', language: 'java', ecosystem: 'maven', categories: ['Networking'], githubRepo: 'netty/netty' },
  { name: 'okhttp', language: 'java', ecosystem: 'maven', categories: ['HTTP Client'], githubRepo: 'square/okhttp' },
  { name: 'retrofit', language: 'java', ecosystem: 'maven', categories: ['HTTP Client'], githubRepo: 'square/retrofit' },
  { name: 'feign', language: 'java', ecosystem: 'maven', categories: ['HTTP Client'], githubRepo: 'OpenFeign/feign' },
  { name: 'rest-assured', language: 'java', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'rest-assured/rest-assured' },
  { name: 'wiremock', language: 'java', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'wiremock/wiremock' },
  { name: 'testcontainers', language: 'java', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'testcontainers/testcontainers-java' },
  { name: 'assertj', language: 'java', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'assertj/assertj' },
  { name: 'awaitility', language: 'java', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'awaitility/awaitility' },
  { name: 'archunit', language: 'java', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'TNG/ArchUnit' },
  { name: 'mybatis', language: 'java', ecosystem: 'maven', categories: ['Database'], githubRepo: 'mybatis/mybatis-3' },
  { name: 'jooq', language: 'java', ecosystem: 'maven', categories: ['Database'], githubRepo: 'jOOQ/jOOQ' },
  { name: 'flyway', language: 'java', ecosystem: 'maven', categories: ['Database Migration'], githubRepo: 'flyway/flyway' },
  { name: 'liquibase', language: 'java', ecosystem: 'maven', categories: ['Database Migration'], githubRepo: 'liquibase/liquibase' },
  { name: 'jedis', language: 'java', ecosystem: 'maven', categories: ['Database'], githubRepo: 'redis/jedis' },
  { name: 'lettuce', language: 'java', ecosystem: 'maven', categories: ['Database'], githubRepo: 'lettuce-io/lettuce-core' },
  { name: 'caffeine', language: 'java', ecosystem: 'maven', categories: ['Caching'], githubRepo: 'ben-manes/caffeine' },
  { name: 'ehcache', language: 'java', ecosystem: 'maven', categories: ['Caching'], githubRepo: 'ehcache/ehcache3' },
  { name: 'mapstruct', language: 'java', ecosystem: 'maven', categories: ['Object Mapping'], githubRepo: 'mapstruct/mapstruct' },
  { name: 'modelmapper', language: 'java', ecosystem: 'maven', categories: ['Object Mapping'], githubRepo: 'modelmapper/modelmapper' },
  { name: 'gson', language: 'java', ecosystem: 'maven', categories: ['JSON'], githubRepo: 'google/gson' },
  { name: 'fastjson', language: 'java', ecosystem: 'maven', categories: ['JSON'], githubRepo: 'alibaba/fastjson' },
  { name: 'snakeyaml', language: 'java', ecosystem: 'maven', categories: ['YAML'], githubRepo: 'snakeyaml/snakeyaml' },
  { name: 'picocli', language: 'java', ecosystem: 'maven', categories: ['CLI Tools'], githubRepo: 'remkop/picocli' },
  { name: 'jcommander', language: 'java', ecosystem: 'maven', categories: ['CLI Tools'], githubRepo: 'cbeust/jcommander' },
  { name: 'javafaker', language: 'java', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'DiUS/java-faker' },
  { name: 'joda-time', language: 'java', ecosystem: 'maven', categories: ['Date/Time'], githubRepo: 'JodaOrg/joda-time' },
  { name: 'streamex', language: 'java', ecosystem: 'maven', categories: ['Streams'], githubRepo: 'amaembo/streamex' },
  { name: 'vavr', language: 'java', ecosystem: 'maven', categories: ['Functional'], githubRepo: 'vavr-io/vavr' },
  { name: 'cyclops', language: 'java', ecosystem: 'maven', categories: ['Functional'], githubRepo: 'aol/cyclops' },
  { name: 'resilience4j', language: 'java', ecosystem: 'maven', categories: ['Resilience'], githubRepo: 'resilience4j/resilience4j' },
  { name: 'hystrix', language: 'java', ecosystem: 'maven', categories: ['Resilience'], githubRepo: 'Netflix/Hystrix' },

  // ============= MORE C# =============
  { name: 'RestSharp', language: 'csharp', ecosystem: 'nuget', categories: ['HTTP Client'], githubRepo: 'restsharp/RestSharp' },
  { name: 'Refit', language: 'csharp', ecosystem: 'nuget', categories: ['HTTP Client'], githubRepo: 'reactiveui/refit' },
  { name: 'Flurl', language: 'csharp', ecosystem: 'nuget', categories: ['HTTP Client'], githubRepo: 'tmenier/Flurl' },
  { name: 'HangFire', language: 'csharp', ecosystem: 'nuget', categories: ['Background Jobs'], githubRepo: 'HangfireIO/Hangfire' },
  { name: 'Quartz.NET', language: 'csharp', ecosystem: 'nuget', categories: ['Scheduling'], githubRepo: 'quartznet/quartznet' },
  { name: 'MassTransit', language: 'csharp', ecosystem: 'nuget', categories: ['Messaging'], githubRepo: 'MassTransit/MassTransit' },
  { name: 'NServiceBus', language: 'csharp', ecosystem: 'nuget', categories: ['Messaging'], githubRepo: 'Particular/NServiceBus' },
  { name: 'RabbitMQ.Client', language: 'csharp', ecosystem: 'nuget', categories: ['Messaging'], githubRepo: 'rabbitmq/rabbitmq-dotnet-client' },
  { name: 'SignalR', language: 'csharp', ecosystem: 'nuget', categories: ['Real-time'], githubRepo: 'SignalR/SignalR' },
  { name: 'IdentityServer4', language: 'csharp', ecosystem: 'nuget', categories: ['Authentication'], githubRepo: 'IdentityServer/IdentityServer4' },
  { name: 'Swashbuckle', language: 'csharp', ecosystem: 'nuget', categories: ['API Documentation'], githubRepo: 'domaindrivendev/Swashbuckle.AspNetCore' },
  { name: 'NSwag', language: 'csharp', ecosystem: 'nuget', categories: ['API Documentation'], githubRepo: 'RicoSuter/NSwag' },
  { name: 'BenchmarkDotNet', language: 'csharp', ecosystem: 'nuget', categories: ['Benchmarking'], githubRepo: 'dotnet/BenchmarkDotNet' },
  { name: 'FluentAssertions', language: 'csharp', ecosystem: 'nuget', categories: ['Testing'], githubRepo: 'fluentassertions/fluentassertions' },
  { name: 'xUnit', language: 'csharp', ecosystem: 'nuget', categories: ['Testing'], githubRepo: 'xunit/xunit' },
  { name: 'Bogus', language: 'csharp', ecosystem: 'nuget', categories: ['Testing'], githubRepo: 'bchavez/Bogus' },
  { name: 'NodaTime', language: 'csharp', ecosystem: 'nuget', categories: ['Date/Time'], githubRepo: 'nodatime/nodatime' },
  { name: 'Humanizer', language: 'csharp', ecosystem: 'nuget', categories: ['String Manipulation'], githubRepo: 'Humanizr/Humanizer' },
  { name: 'CsvHelper', language: 'csharp', ecosystem: 'nuget', categories: ['CSV'], githubRepo: 'JoshClose/CsvHelper' },
  { name: 'EPPlus', language: 'csharp', ecosystem: 'nuget', categories: ['Excel'], githubRepo: 'EPPlusSoftware/EPPlus' },
  { name: 'ClosedXML', language: 'csharp', ecosystem: 'nuget', categories: ['Excel'], githubRepo: 'ClosedXML/ClosedXML' },
  { name: 'ImageSharp', language: 'csharp', ecosystem: 'nuget', categories: ['Image Processing'], githubRepo: 'SixLabors/ImageSharp' },
  { name: 'QuestPDF', language: 'csharp', ecosystem: 'nuget', categories: ['PDF'], githubRepo: 'QuestPDF/QuestPDF' },
  { name: 'iTextSharp', language: 'csharp', ecosystem: 'nuget', categories: ['PDF'], githubRepo: 'itext/itextsharp' },
  { name: 'MailKit', language: 'csharp', ecosystem: 'nuget', categories: ['Email'], githubRepo: 'jstedfast/MailKit' },
  { name: 'Spectre.Console', language: 'csharp', ecosystem: 'nuget', categories: ['CLI Tools'], githubRepo: 'spectreconsole/spectre.console' },
  { name: 'CommandLineParser', language: 'csharp', ecosystem: 'nuget', categories: ['CLI Tools'], githubRepo: 'commandlineparser/commandline' },
  { name: 'Ocelot', language: 'csharp', ecosystem: 'nuget', categories: ['API Gateway'], githubRepo: 'ThreeMammals/Ocelot' },
  { name: 'GraphQL.NET', language: 'csharp', ecosystem: 'nuget', categories: ['GraphQL'], githubRepo: 'graphql-dotnet/graphql-dotnet' },
  { name: 'HotChocolate', language: 'csharp', ecosystem: 'nuget', categories: ['GraphQL'], githubRepo: 'ChilliCream/graphql-platform' },

  // ============= MORE RUBY =============
  { name: 'grape', language: 'ruby', ecosystem: 'rubygems', categories: ['Web Frameworks'], githubRepo: 'ruby-grape/grape' },
  { name: 'hanami', language: 'ruby', ecosystem: 'rubygems', categories: ['Web Frameworks'], githubRepo: 'hanami/hanami' },
  { name: 'padrino', language: 'ruby', ecosystem: 'rubygems', categories: ['Web Frameworks'], githubRepo: 'padrino/padrino-framework' },
  { name: 'rack', language: 'ruby', ecosystem: 'rubygems', categories: ['Web Development'], githubRepo: 'rack/rack' },
  { name: 'unicorn', language: 'ruby', ecosystem: 'rubygems', categories: ['Web Servers'], githubRepo: 'defunkt/unicorn' },
  { name: 'passenger', language: 'ruby', ecosystem: 'rubygems', categories: ['Web Servers'], githubRepo: 'phusion/passenger' },
  { name: 'capybara', language: 'ruby', ecosystem: 'rubygems', categories: ['Testing'], githubRepo: 'teamcapybara/capybara' },
  { name: 'vcr', language: 'ruby', ecosystem: 'rubygems', categories: ['Testing'], githubRepo: 'vcr/vcr' },
  { name: 'webmock', language: 'ruby', ecosystem: 'rubygems', categories: ['Testing'], githubRepo: 'bblimke/webmock' },
  { name: 'simplecov', language: 'ruby', ecosystem: 'rubygems', categories: ['Testing'], githubRepo: 'simplecov-ruby/simplecov' },
  { name: 'minitest', language: 'ruby', ecosystem: 'rubygems', categories: ['Testing'], githubRepo: 'minitest/minitest' },
  { name: 'shoulda-matchers', language: 'ruby', ecosystem: 'rubygems', categories: ['Testing'], githubRepo: 'thoughtbot/shoulda-matchers' },
  { name: 'cucumber', language: 'ruby', ecosystem: 'rubygems', categories: ['Testing'], githubRepo: 'cucumber/cucumber-ruby' },
  { name: 'activerecord', language: 'ruby', ecosystem: 'rubygems', categories: ['Database'], githubRepo: 'rails/rails' },
  { name: 'sequel', language: 'ruby', ecosystem: 'rubygems', categories: ['Database'], githubRepo: 'jeremyevans/sequel' },
  { name: 'rom-rb', language: 'ruby', ecosystem: 'rubygems', categories: ['Database'], githubRepo: 'rom-rb/rom' },
  { name: 'redis-rb', language: 'ruby', ecosystem: 'rubygems', categories: ['Database'], githubRepo: 'redis/redis-rb' },
  { name: 'mongoid', language: 'ruby', ecosystem: 'rubygems', categories: ['Database'], githubRepo: 'mongodb/mongoid' },
  { name: 'elasticsearch-ruby', language: 'ruby', ecosystem: 'rubygems', categories: ['Search'], githubRepo: 'elastic/elasticsearch-ruby' },
  { name: 'dry-rb', language: 'ruby', ecosystem: 'rubygems', categories: ['Utilities'], githubRepo: 'dry-rb/dry-rb.org' },
  { name: 'activejob', language: 'ruby', ecosystem: 'rubygems', categories: ['Background Jobs'], githubRepo: 'rails/rails' },
  { name: 'delayed_job', language: 'ruby', ecosystem: 'rubygems', categories: ['Background Jobs'], githubRepo: 'collectiveidea/delayed_job' },
  { name: 'resque', language: 'ruby', ecosystem: 'rubygems', categories: ['Background Jobs'], githubRepo: 'resque/resque' },
  { name: 'kaminari', language: 'ruby', ecosystem: 'rubygems', categories: ['Pagination'], githubRepo: 'kaminari/kaminari' },
  { name: 'will_paginate', language: 'ruby', ecosystem: 'rubygems', categories: ['Pagination'], githubRepo: 'mislav/will_paginate' },
  { name: 'pundit', language: 'ruby', ecosystem: 'rubygems', categories: ['Authorization'], githubRepo: 'varvet/pundit' },
  { name: 'cancancan', language: 'ruby', ecosystem: 'rubygems', categories: ['Authorization'], githubRepo: 'CanCanCommunity/cancancan' },
  { name: 'omniauth', language: 'ruby', ecosystem: 'rubygems', categories: ['Authentication'], githubRepo: 'omniauth/omniauth' },
  { name: 'jwt', language: 'ruby', ecosystem: 'rubygems', categories: ['Authentication'], githubRepo: 'jwt/ruby-jwt' },
  { name: 'rack-attack', language: 'ruby', ecosystem: 'rubygems', categories: ['Security'], githubRepo: 'rack/rack-attack' },
  { name: 'brakeman', language: 'ruby', ecosystem: 'rubygems', categories: ['Security'], githubRepo: 'presidentbeef/brakeman' },
  { name: 'bundler-audit', language: 'ruby', ecosystem: 'rubygems', categories: ['Security'], githubRepo: 'rubysec/bundler-audit' },
  { name: 'pry', language: 'ruby', ecosystem: 'rubygems', categories: ['Debugging'], githubRepo: 'pry/pry' },
  { name: 'byebug', language: 'ruby', ecosystem: 'rubygems', categories: ['Debugging'], githubRepo: 'deivid-rodriguez/byebug' },
  { name: 'awesome_print', language: 'ruby', ecosystem: 'rubygems', categories: ['Debugging'], githubRepo: 'awesome-print/awesome_print' },

  // ============= MORE PHP =============
  { name: 'phpmailer', language: 'php', ecosystem: 'packagist', categories: ['Email'], githubRepo: 'PHPMailer/PHPMailer' },
  { name: 'swiftmailer', language: 'php', ecosystem: 'packagist', categories: ['Email'], githubRepo: 'swiftmailer/swiftmailer' },
  { name: 'phpdotenv', language: 'php', ecosystem: 'packagist', categories: ['Configuration'], githubRepo: 'vlucas/phpdotenv' },
  { name: 'carbon', language: 'php', ecosystem: 'packagist', categories: ['Date/Time'], githubRepo: 'briannesbitt/Carbon' },
  { name: 'flysystem', language: 'php', ecosystem: 'packagist', categories: ['File System'], githubRepo: 'thephpleague/flysystem' },
  { name: 'intervention-image', language: 'php', ecosystem: 'packagist', categories: ['Image Processing'], githubRepo: 'Intervention/image' },
  { name: 'phpunit', language: 'php', ecosystem: 'packagist', categories: ['Testing'], githubRepo: 'sebastianbergmann/phpunit' },
  { name: 'mockery', language: 'php', ecosystem: 'packagist', categories: ['Testing'], githubRepo: 'mockery/mockery' },
  { name: 'prophecy', language: 'php', ecosystem: 'packagist', categories: ['Testing'], githubRepo: 'phpspec/prophecy' },
  { name: 'pest', language: 'php', ecosystem: 'packagist', categories: ['Testing'], githubRepo: 'pestphp/pest' },
  { name: 'codeception', language: 'php', ecosystem: 'packagist', categories: ['Testing'], githubRepo: 'Codeception/Codeception' },
  { name: 'behat', language: 'php', ecosystem: 'packagist', categories: ['Testing'], githubRepo: 'Behat/Behat' },
  { name: 'phpspec', language: 'php', ecosystem: 'packagist', categories: ['Testing'], githubRepo: 'phpspec/phpspec' },
  { name: 'php-cs-fixer', language: 'php', ecosystem: 'packagist', categories: ['Code Quality'], githubRepo: 'PHP-CS-Fixer/PHP-CS-Fixer' },
  { name: 'psalm', language: 'php', ecosystem: 'packagist', categories: ['Static Analysis'], githubRepo: 'vimeo/psalm' },
  { name: 'phan', language: 'php', ecosystem: 'packagist', categories: ['Static Analysis'], githubRepo: 'phan/phan' },
  { name: 'phpmd', language: 'php', ecosystem: 'packagist', categories: ['Code Quality'], githubRepo: 'phpmd/phpmd' },
  { name: 'phpcpd', language: 'php', ecosystem: 'packagist', categories: ['Code Quality'], githubRepo: 'sebastianbergmann/phpcpd' },
  { name: 'php-parser', language: 'php', ecosystem: 'packagist', categories: ['Parsing'], githubRepo: 'nikic/PHP-Parser' },
  { name: 'ramsey-uuid', language: 'php', ecosystem: 'packagist', categories: ['Utilities'], githubRepo: 'ramsey/uuid' },
  { name: 'league-container', language: 'php', ecosystem: 'packagist', categories: ['DI Container'], githubRepo: 'thephpleague/container' },
  { name: 'php-di', language: 'php', ecosystem: 'packagist', categories: ['DI Container'], githubRepo: 'PHP-DI/PHP-DI' },
  { name: 'symfony-console', language: 'php', ecosystem: 'packagist', categories: ['CLI Tools'], githubRepo: 'symfony/console' },
  { name: 'laravel-zero', language: 'php', ecosystem: 'packagist', categories: ['CLI Tools'], githubRepo: 'laravel-zero/laravel-zero' },
  { name: 'minicli', language: 'php', ecosystem: 'packagist', categories: ['CLI Tools'], githubRepo: 'minicli/minicli' },
  { name: 'phpredis', language: 'php', ecosystem: 'packagist', categories: ['Database'], githubRepo: 'phpredis/phpredis' },
  { name: 'predis', language: 'php', ecosystem: 'packagist', categories: ['Database'], githubRepo: 'predis/predis' },
  { name: 'eloquent', language: 'php', ecosystem: 'packagist', categories: ['Database'], githubRepo: 'illuminate/database' },
  { name: 'propel', language: 'php', ecosystem: 'packagist', categories: ['Database'], githubRepo: 'propelorm/Propel2' },
  { name: 'cycle-orm', language: 'php', ecosystem: 'packagist', categories: ['Database'], githubRepo: 'cycle/orm' },
  { name: 'dompdf', language: 'php', ecosystem: 'packagist', categories: ['PDF'], githubRepo: 'dompdf/dompdf' },
  { name: 'mpdf', language: 'php', ecosystem: 'packagist', categories: ['PDF'], githubRepo: 'mpdf/mpdf' },
  { name: 'tcpdf', language: 'php', ecosystem: 'packagist', categories: ['PDF'], githubRepo: 'tecnickcom/TCPDF' },
  { name: 'phpspreadsheet', language: 'php', ecosystem: 'packagist', categories: ['Excel'], githubRepo: 'PHPOffice/PhpSpreadsheet' },

  // ============= MORE R =============
  { name: 'data.table', language: 'r', ecosystem: 'CRAN', categories: ['Data Manipulation'], githubRepo: 'Rdatatable/data.table' },
  { name: 'caret', language: 'r', ecosystem: 'CRAN', categories: ['Machine Learning'], githubRepo: 'topepo/caret' },
  { name: 'mlr3', language: 'r', ecosystem: 'CRAN', categories: ['Machine Learning'], githubRepo: 'mlr-org/mlr3' },
  { name: 'randomForest', language: 'r', ecosystem: 'CRAN', categories: ['Machine Learning'], githubRepo: 'cran/randomForest' },
  { name: 'xgboost', language: 'r', ecosystem: 'CRAN', categories: ['Machine Learning'], githubRepo: 'dmlc/xgboost' },
  { name: 'forecast', language: 'r', ecosystem: 'CRAN', categories: ['Time Series'], githubRepo: 'robjhyndman/forecast' },
  { name: 'prophet', language: 'r', ecosystem: 'CRAN', categories: ['Time Series'], githubRepo: 'facebook/prophet' },
  { name: 'tsibble', language: 'r', ecosystem: 'CRAN', categories: ['Time Series'], githubRepo: 'tidyverts/tsibble' },
  { name: 'lubridate', language: 'r', ecosystem: 'CRAN', categories: ['Date/Time'], githubRepo: 'tidyverse/lubridate' },
  { name: 'stringr', language: 'r', ecosystem: 'CRAN', categories: ['String Manipulation'], githubRepo: 'tidyverse/stringr' },
  { name: 'readr', language: 'r', ecosystem: 'CRAN', categories: ['Data Import'], githubRepo: 'tidyverse/readr' },
  { name: 'haven', language: 'r', ecosystem: 'CRAN', categories: ['Data Import'], githubRepo: 'tidyverse/haven' },
  { name: 'jsonlite', language: 'r', ecosystem: 'CRAN', categories: ['JSON'], githubRepo: 'jeroen/jsonlite' },
  { name: 'httr', language: 'r', ecosystem: 'CRAN', categories: ['HTTP Client'], githubRepo: 'r-lib/httr' },
  { name: 'rvest', language: 'r', ecosystem: 'CRAN', categories: ['Web Scraping'], githubRepo: 'tidyverse/rvest' },
  { name: 'xml2', language: 'r', ecosystem: 'CRAN', categories: ['XML'], githubRepo: 'r-lib/xml2' },
  { name: 'DBI', language: 'r', ecosystem: 'CRAN', categories: ['Database'], githubRepo: 'r-dbi/DBI' },
  { name: 'RSQLite', language: 'r', ecosystem: 'CRAN', categories: ['Database'], githubRepo: 'r-dbi/RSQLite' },
  { name: 'RPostgreSQL', language: 'r', ecosystem: 'CRAN', categories: ['Database'], githubRepo: 'tomoakin/RPostgreSQL' },
  { name: 'testthat', language: 'r', ecosystem: 'CRAN', categories: ['Testing'], githubRepo: 'r-lib/testthat' },
  { name: 'covr', language: 'r', ecosystem: 'CRAN', categories: ['Testing'], githubRepo: 'r-lib/covr' },
  { name: 'devtools', language: 'r', ecosystem: 'CRAN', categories: ['Development'], githubRepo: 'r-lib/devtools' },
  { name: 'usethis', language: 'r', ecosystem: 'CRAN', categories: ['Development'], githubRepo: 'r-lib/usethis' },
  { name: 'roxygen2', language: 'r', ecosystem: 'CRAN', categories: ['Documentation'], githubRepo: 'r-lib/roxygen2' },
  { name: 'pkgdown', language: 'r', ecosystem: 'CRAN', categories: ['Documentation'], githubRepo: 'r-lib/pkgdown' },
  { name: 'rmarkdown', language: 'r', ecosystem: 'CRAN', categories: ['Documentation'], githubRepo: 'rstudio/rmarkdown' },
  { name: 'knitr', language: 'r', ecosystem: 'CRAN', categories: ['Documentation'], githubRepo: 'yihui/knitr' },
  { name: 'bookdown', language: 'r', ecosystem: 'CRAN', categories: ['Documentation'], githubRepo: 'rstudio/bookdown' },

  // ============= MORE SWIFT =============
  { name: 'SwiftyJSON', language: 'swift', ecosystem: 'CocoaPods', categories: ['JSON'], githubRepo: 'SwiftyJSON/SwiftyJSON' },
  { name: 'Moya', language: 'swift', ecosystem: 'CocoaPods', categories: ['Networking'], githubRepo: 'Moya/Moya' },
  { name: 'RxSwift', language: 'swift', ecosystem: 'CocoaPods', categories: ['Reactive'], githubRepo: 'ReactiveX/RxSwift' },
  { name: 'PromiseKit', language: 'swift', ecosystem: 'CocoaPods', categories: ['Async'], githubRepo: 'mxcl/PromiseKit' },
  { name: 'Combine', language: 'swift', ecosystem: 'CocoaPods', categories: ['Reactive'], githubRepo: 'CombineCommunity/CombineExt' },
  { name: 'SwiftLint', language: 'swift', ecosystem: 'CocoaPods', categories: ['Code Quality'], githubRepo: 'realm/SwiftLint' },
  { name: 'Quick', language: 'swift', ecosystem: 'CocoaPods', categories: ['Testing'], githubRepo: 'Quick/Quick' },
  { name: 'Nimble', language: 'swift', ecosystem: 'CocoaPods', categories: ['Testing'], githubRepo: 'Quick/Nimble' },
  { name: 'RealmSwift', language: 'swift', ecosystem: 'CocoaPods', categories: ['Database'], githubRepo: 'realm/realm-swift' },
  { name: 'GRDB', language: 'swift', ecosystem: 'CocoaPods', categories: ['Database'], githubRepo: 'groue/GRDB.swift' },
  { name: 'SQLite.swift', language: 'swift', ecosystem: 'CocoaPods', categories: ['Database'], githubRepo: 'stephencelis/SQLite.swift' },
  { name: 'Vapor', language: 'swift', ecosystem: 'CocoaPods', categories: ['Web Frameworks'], githubRepo: 'vapor/vapor' },
  { name: 'Perfect', language: 'swift', ecosystem: 'CocoaPods', categories: ['Web Frameworks'], githubRepo: 'PerfectlySoft/Perfect' },
  { name: 'Kitura', language: 'swift', ecosystem: 'CocoaPods', categories: ['Web Frameworks'], githubRepo: 'Kitura/Kitura' },
  { name: 'SwiftNIO', language: 'swift', ecosystem: 'CocoaPods', categories: ['Networking'], githubRepo: 'apple/swift-nio' },
  { name: 'SDWebImage', language: 'swift', ecosystem: 'CocoaPods', categories: ['Image Processing'], githubRepo: 'SDWebImage/SDWebImage' },
  { name: 'Hero', language: 'swift', ecosystem: 'CocoaPods', categories: ['Animation'], githubRepo: 'HeroTransitions/Hero' },
  { name: 'Lottie', language: 'swift', ecosystem: 'CocoaPods', categories: ['Animation'], githubRepo: 'airbnb/lottie-ios' },
  { name: 'Charts', language: 'swift', ecosystem: 'CocoaPods', categories: ['Visualization'], githubRepo: 'danielgindi/Charts' },
  { name: 'FSCalendar', language: 'swift', ecosystem: 'CocoaPods', categories: ['UI Components'], githubRepo: 'WenchaoD/FSCalendar' },
  { name: 'IQKeyboardManager', language: 'swift', ecosystem: 'CocoaPods', categories: ['UI Components'], githubRepo: 'hackiftekhar/IQKeyboardManager' },

  // ============= MORE KOTLIN =============
  { name: 'arrow', language: 'kotlin', ecosystem: 'maven', categories: ['Functional'], githubRepo: 'arrow-kt/arrow' },
  { name: 'koin', language: 'kotlin', ecosystem: 'maven', categories: ['DI'], githubRepo: 'InsertKoinIO/koin' },
  { name: 'dagger-hilt', language: 'kotlin', ecosystem: 'maven', categories: ['DI'], githubRepo: 'google/dagger' },
  { name: 'retrofit', language: 'kotlin', ecosystem: 'maven', categories: ['Networking'], githubRepo: 'square/retrofit' },
  { name: 'moshi', language: 'kotlin', ecosystem: 'maven', categories: ['JSON'], githubRepo: 'square/moshi' },
  { name: 'room', language: 'kotlin', ecosystem: 'maven', categories: ['Database'], githubRepo: 'androidx/androidx' },
  { name: 'jetpack-compose', language: 'kotlin', ecosystem: 'maven', categories: ['UI'], githubRepo: 'androidx/androidx' },
  { name: 'kotest', language: 'kotlin', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'kotest/kotest' },
  { name: 'mockk', language: 'kotlin', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'mockk/mockk' },
  { name: 'detekt', language: 'kotlin', ecosystem: 'maven', categories: ['Code Quality'], githubRepo: 'detekt/detekt' },
  { name: 'ktlint', language: 'kotlin', ecosystem: 'maven', categories: ['Code Quality'], githubRepo: 'pinterest/ktlint' },
  { name: 'flow', language: 'kotlin', ecosystem: 'maven', categories: ['Reactive'], githubRepo: 'Kotlin/kotlinx.coroutines' },
  { name: 'fuel', language: 'kotlin', ecosystem: 'maven', categories: ['HTTP Client'], githubRepo: 'kittinunf/fuel' },
  { name: 'ksp', language: 'kotlin', ecosystem: 'maven', categories: ['Code Generation'], githubRepo: 'google/ksp' },
  { name: 'sqldelight', language: 'kotlin', ecosystem: 'maven', categories: ['Database'], githubRepo: 'cashapp/sqldelight' },
  { name: 'accompanist', language: 'kotlin', ecosystem: 'maven', categories: ['UI'], githubRepo: 'google/accompanist' },
  { name: 'coil', language: 'kotlin', ecosystem: 'maven', categories: ['Image Loading'], githubRepo: 'coil-kt/coil' },
  { name: 'glide', language: 'kotlin', ecosystem: 'maven', categories: ['Image Loading'], githubRepo: 'bumptech/glide' },
  { name: 'okio', language: 'kotlin', ecosystem: 'maven', categories: ['I/O'], githubRepo: 'square/okio' },
  { name: 'rxkotlin', language: 'kotlin', ecosystem: 'maven', categories: ['Reactive'], githubRepo: 'ReactiveX/RxKotlin' },

  // ============= MORE DART =============
  { name: 'riverpod', language: 'dart', ecosystem: 'pub.dev', categories: ['State Management'], githubRepo: 'rrousselGit/river_pod' },
  { name: 'freezed', language: 'dart', ecosystem: 'pub.dev', categories: ['Code Generation'], githubRepo: 'rrousselGit/freezed' },
  { name: 'json_serializable', language: 'dart', ecosystem: 'pub.dev', categories: ['Serialization'], githubRepo: 'google/json_serializable.dart' },
  { name: 'hive', language: 'dart', ecosystem: 'pub.dev', categories: ['Database'], githubRepo: 'isar/hive' },
  { name: 'isar', language: 'dart', ecosystem: 'pub.dev', categories: ['Database'], githubRepo: 'isar/isar' },
  { name: 'drift', language: 'dart', ecosystem: 'pub.dev', categories: ['Database'], githubRepo: 'simolus3/drift' },
  { name: 'firebase_core', language: 'dart', ecosystem: 'pub.dev', categories: ['Backend'], githubRepo: 'firebase/flutterfire' },
  { name: 'cloud_firestore', language: 'dart', ecosystem: 'pub.dev', categories: ['Database'], githubRepo: 'firebase/flutterfire' },
  { name: 'firebase_auth', language: 'dart', ecosystem: 'pub.dev', categories: ['Authentication'], githubRepo: 'firebase/flutterfire' },
  { name: 'shared_preferences', language: 'dart', ecosystem: 'pub.dev', categories: ['Storage'], githubRepo: 'flutter/packages' },
  { name: 'path_provider', language: 'dart', ecosystem: 'pub.dev', categories: ['File System'], githubRepo: 'flutter/packages' },
  { name: 'cached_network_image', language: 'dart', ecosystem: 'pub.dev', categories: ['Image Loading'], githubRepo: 'Baseflow/flutter_cached_network_image' },
  { name: 'image_picker', language: 'dart', ecosystem: 'pub.dev', categories: ['Media'], githubRepo: 'flutter/packages' },
  { name: 'url_launcher', language: 'dart', ecosystem: 'pub.dev', categories: ['Utilities'], githubRepo: 'flutter/packages' },
  { name: 'webview_flutter', language: 'dart', ecosystem: 'pub.dev', categories: ['Web View'], githubRepo: 'flutter/packages' },
  { name: 'flutter_local_notifications', language: 'dart', ecosystem: 'pub.dev', categories: ['Notifications'], githubRepo: 'MaikuB/flutter_local_notifications' },
  { name: 'connectivity_plus', language: 'dart', ecosystem: 'pub.dev', categories: ['Network'], githubRepo: 'fluttercommunity/plus_plugins' },
  { name: 'permission_handler', language: 'dart', ecosystem: 'pub.dev', categories: ['Permissions'], githubRepo: 'Baseflow/flutter-permission-handler' },
  { name: 'geolocator', language: 'dart', ecosystem: 'pub.dev', categories: ['Location'], githubRepo: 'Baseflow/flutter-geolocator' },
  { name: 'google_maps_flutter', language: 'dart', ecosystem: 'pub.dev', categories: ['Maps'], githubRepo: 'flutter/packages' },
  { name: 'camera', language: 'dart', ecosystem: 'pub.dev', categories: ['Media'], githubRepo: 'flutter/packages' },
  { name: 'video_player', language: 'dart', ecosystem: 'pub.dev', categories: ['Media'], githubRepo: 'flutter/packages' },
  { name: 'flutter_svg', language: 'dart', ecosystem: 'pub.dev', categories: ['Graphics'], githubRepo: 'dnfield/flutter_svg' },
  { name: 'intl', language: 'dart', ecosystem: 'pub.dev', categories: ['Internationalization'], githubRepo: 'dart-lang/i18n' },
  { name: 'flutter_test', language: 'dart', ecosystem: 'pub.dev', categories: ['Testing'], githubRepo: 'flutter/flutter' },

  // ============= MORE ELIXIR =============
  { name: 'plug', language: 'elixir', ecosystem: 'hex.pm', categories: ['Web Development'], githubRepo: 'elixir-plug/plug' },
  { name: 'cowboy', language: 'elixir', ecosystem: 'hex.pm', categories: ['Web Servers'], githubRepo: 'ninenines/cowboy' },
  { name: 'poison', language: 'elixir', ecosystem: 'hex.pm', categories: ['JSON'], githubRepo: 'devinus/poison' },
  { name: 'jason', language: 'elixir', ecosystem: 'hex.pm', categories: ['JSON'], githubRepo: 'michalmuskala/jason' },
  { name: 'httpoison', language: 'elixir', ecosystem: 'hex.pm', categories: ['HTTP Client'], githubRepo: 'edgurgel/httpoison' },
  { name: 'tesla', language: 'elixir', ecosystem: 'hex.pm', categories: ['HTTP Client'], githubRepo: 'elixir-tesla/tesla' },
  { name: 'postgrex', language: 'elixir', ecosystem: 'hex.pm', categories: ['Database'], githubRepo: 'elixir-ecto/postgrex' },
  { name: 'myxql', language: 'elixir', ecosystem: 'hex.pm', categories: ['Database'], githubRepo: 'elixir-ecto/myxql' },
  { name: 'redix', language: 'elixir', ecosystem: 'hex.pm', categories: ['Database'], githubRepo: 'whatyouhide/redix' },
  { name: 'mongodb', language: 'elixir', ecosystem: 'hex.pm', categories: ['Database'], githubRepo: 'kobil-systems/mongodb' },
  { name: 'ex_unit', language: 'elixir', ecosystem: 'hex.pm', categories: ['Testing'], githubRepo: 'elixir-lang/elixir' },
  { name: 'mox', language: 'elixir', ecosystem: 'hex.pm', categories: ['Testing'], githubRepo: 'dashbitco/mox' },
  { name: 'excoveralls', language: 'elixir', ecosystem: 'hex.pm', categories: ['Testing'], githubRepo: 'parroty/excoveralls' },
  { name: 'oban', language: 'elixir', ecosystem: 'hex.pm', categories: ['Background Jobs'], githubRepo: 'sorentwo/oban' },
  { name: 'quantum', language: 'elixir', ecosystem: 'hex.pm', categories: ['Scheduling'], githubRepo: 'quantum-elixir/quantum-core' },
  { name: 'ex_machina', language: 'elixir', ecosystem: 'hex.pm', categories: ['Testing'], githubRepo: 'thoughtbot/ex_machina' },
  { name: 'timex', language: 'elixir', ecosystem: 'hex.pm', categories: ['Date/Time'], githubRepo: 'bitwalker/timex' },
  { name: 'decimal', language: 'elixir', ecosystem: 'hex.pm', categories: ['Math'], githubRepo: 'ericmj/decimal' },
  { name: 'comeonin', language: 'elixir', ecosystem: 'hex.pm', categories: ['Authentication'], githubRepo: 'riverrun/comeonin' },
  { name: 'guardian', language: 'elixir', ecosystem: 'hex.pm', categories: ['Authentication'], githubRepo: 'ueberauth/guardian' },

  // ============= MORE HASKELL =============
  { name: 'wai', language: 'haskell', ecosystem: 'Hackage', categories: ['Web Development'], githubRepo: 'yesodweb/wai' },
  { name: 'warp', language: 'haskell', ecosystem: 'Hackage', categories: ['Web Servers'], githubRepo: 'yesodweb/wai' },
  { name: 'scotty', language: 'haskell', ecosystem: 'Hackage', categories: ['Web Frameworks'], githubRepo: 'scotty-web/scotty' },
  { name: 'spock', language: 'haskell', ecosystem: 'Hackage', categories: ['Web Frameworks'], githubRepo: 'agrafix/Spock' },
  { name: 'persistent', language: 'haskell', ecosystem: 'Hackage', categories: ['Database'], githubRepo: 'yesodweb/persistent' },
  { name: 'esqueleto', language: 'haskell', ecosystem: 'Hackage', categories: ['Database'], githubRepo: 'bitemyapp/esqueleto' },
  { name: 'hedis', language: 'haskell', ecosystem: 'Hackage', categories: ['Database'], githubRepo: 'informatikr/hedis' },
  { name: 'postgresql-simple', language: 'haskell', ecosystem: 'Hackage', categories: ['Database'], githubRepo: 'haskellari/postgresql-simple' },
  { name: 'wreq', language: 'haskell', ecosystem: 'Hackage', categories: ['HTTP Client'], githubRepo: 'haskell/wreq' },
  { name: 'http-client', language: 'haskell', ecosystem: 'Hackage', categories: ['HTTP Client'], githubRepo: 'snoyberg/http-client' },
  { name: 'conduit', language: 'haskell', ecosystem: 'Hackage', categories: ['Streaming'], githubRepo: 'snoyberg/conduit' },
  { name: 'pipes', language: 'haskell', ecosystem: 'Hackage', categories: ['Streaming'], githubRepo: 'Gabriella439/Haskell-Pipes-Library' },
  { name: 'optparse-applicative', language: 'haskell', ecosystem: 'Hackage', categories: ['CLI Tools'], githubRepo: 'pcapriotti/optparse-applicative' },
  { name: 'hspec', language: 'haskell', ecosystem: 'Hackage', categories: ['Testing'], githubRepo: 'hspec/hspec' },
  { name: 'quickcheck', language: 'haskell', ecosystem: 'Hackage', categories: ['Testing'], githubRepo: 'nick8325/quickcheck' },
  { name: 'tasty', language: 'haskell', ecosystem: 'Hackage', categories: ['Testing'], githubRepo: 'UnkindPartition/tasty' },

  // ============= MORE SCALA =============
  { name: 'http4s', language: 'scala', ecosystem: 'maven', categories: ['Web Frameworks'], githubRepo: 'http4s/http4s' },
  { name: 'finch', language: 'scala', ecosystem: 'maven', categories: ['Web Frameworks'], githubRepo: 'finagle/finch' },
  { name: 'scalatra', language: 'scala', ecosystem: 'maven', categories: ['Web Frameworks'], githubRepo: 'scalatra/scalatra' },
  { name: 'slick', language: 'scala', ecosystem: 'maven', categories: ['Database'], githubRepo: 'slick/slick' },
  { name: 'doobie', language: 'scala', ecosystem: 'maven', categories: ['Database'], githubRepo: 'tpolecat/doobie' },
  { name: 'circe', language: 'scala', ecosystem: 'maven', categories: ['JSON'], githubRepo: 'circe/circe' },
  { name: 'play-json', language: 'scala', ecosystem: 'maven', categories: ['JSON'], githubRepo: 'playframework/play-json' },
  { name: 'scalatest', language: 'scala', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'scalatest/scalatest' },
  { name: 'specs2', language: 'scala', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'etorreborre/specs2' },
  { name: 'scalamock', language: 'scala', ecosystem: 'maven', categories: ['Testing'], githubRepo: 'paulbutcher/ScalaMock' },
  { name: 'scopt', language: 'scala', ecosystem: 'maven', categories: ['CLI Tools'], githubRepo: 'scopt/scopt' },
  { name: 'decline', language: 'scala', ecosystem: 'maven', categories: ['CLI Tools'], githubRepo: 'bkirwi/decline' },
  { name: 'fs2', language: 'scala', ecosystem: 'maven', categories: ['Streaming'], githubRepo: 'typelevel/fs2' },
  { name: 'monix', language: 'scala', ecosystem: 'maven', categories: ['Reactive'], githubRepo: 'monix/monix' },
  { name: 'zio', language: 'scala', ecosystem: 'maven', categories: ['Functional'], githubRepo: 'zio/zio' },
  { name: 'shapeless', language: 'scala', ecosystem: 'maven', categories: ['Generic Programming'], githubRepo: 'milessabin/shapeless' },

  // ============= MORE C++ =============
  { name: 'eigen', language: 'cpp', ecosystem: 'vcpkg', categories: ['Linear Algebra'], githubRepo: 'libigl/eigen' },
  { name: 'opencv', language: 'cpp', ecosystem: 'vcpkg', categories: ['Computer Vision'], githubRepo: 'opencv/opencv' },
  { name: 'protobuf', language: 'cpp', ecosystem: 'vcpkg', categories: ['Serialization'], githubRepo: 'protocolbuffers/protobuf' },
  { name: 'grpc', language: 'cpp', ecosystem: 'vcpkg', categories: ['RPC'], githubRepo: 'grpc/grpc' },
  { name: 'abseil', language: 'cpp', ecosystem: 'vcpkg', categories: ['Utilities'], githubRepo: 'abseil/abseil-cpp' },
  { name: 'folly', language: 'cpp', ecosystem: 'vcpkg', categories: ['Utilities'], githubRepo: 'facebook/folly' },
  { name: 'poco', language: 'cpp', ecosystem: 'vcpkg', categories: ['Networking'], githubRepo: 'pocoproject/poco' },
  { name: 'cpr', language: 'cpp', ecosystem: 'vcpkg', categories: ['HTTP Client'], githubRepo: 'libcpr/cpr' },
  { name: 'restclient-cpp', language: 'cpp', ecosystem: 'vcpkg', categories: ['HTTP Client'], githubRepo: 'mrtazz/restclient-cpp' },
  { name: 'crow', language: 'cpp', ecosystem: 'vcpkg', categories: ['Web Frameworks'], githubRepo: 'CrowCpp/Crow' },
  { name: 'drogon', language: 'cpp', ecosystem: 'vcpkg', categories: ['Web Frameworks'], githubRepo: 'drogonframework/drogon' },
  { name: 'pistache', language: 'cpp', ecosystem: 'vcpkg', categories: ['Web Frameworks'], githubRepo: 'pistacheio/pistache' },
  { name: 'sqlitecpp', language: 'cpp', ecosystem: 'vcpkg', categories: ['Database'], githubRepo: 'SRombauts/SQLiteCpp' },
  { name: 'odb', language: 'cpp', ecosystem: 'vcpkg', categories: ['ORM'], githubRepo: 'boris-kolpackov/odb' },
  { name: 'gtest', language: 'cpp', ecosystem: 'vcpkg', categories: ['Testing'], githubRepo: 'google/googletest' },
  { name: 'benchmark', language: 'cpp', ecosystem: 'vcpkg', categories: ['Benchmarking'], githubRepo: 'google/benchmark' },
  { name: 'rapidjson', language: 'cpp', ecosystem: 'vcpkg', categories: ['JSON'], githubRepo: 'Tencent/rapidjson' },
  { name: 'yaml-cpp', language: 'cpp', ecosystem: 'vcpkg', categories: ['YAML'], githubRepo: 'jbeder/yaml-cpp' },
  { name: 'toml++', language: 'cpp', ecosystem: 'vcpkg', categories: ['TOML'], githubRepo: 'marzer/tomlplusplus' },
  { name: 'cli11', language: 'cpp', ecosystem: 'vcpkg', categories: ['CLI Tools'], githubRepo: 'CLIUtils/CLI11' },
  { name: 'argparse', language: 'cpp', ecosystem: 'vcpkg', categories: ['CLI Tools'], githubRepo: 'p-ranav/argparse' },
  { name: 'rang', language: 'cpp', ecosystem: 'vcpkg', categories: ['CLI Tools'], githubRepo: 'agauniyal/rang' },
  { name: 'indicators', language: 'cpp', ecosystem: 'vcpkg', categories: ['CLI Tools'], githubRepo: 'p-ranav/indicators' },
  { name: 'asio', language: 'cpp', ecosystem: 'vcpkg', categories: ['Networking'], githubRepo: 'chriskohlhoff/asio' },
  { name: 'websocketpp', language: 'cpp', ecosystem: 'vcpkg', categories: ['WebSocket'], githubRepo: 'zaphoyd/websocketpp' },
];


  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;
  const failedPackages: string[] = [];
  const skippedPackages: string[] = [];

  // ⚡ PARALLEL PROCESSING: Process packages in batches for 10x speed improvement
  const BATCH_SIZE = 15; // Process 15 packages concurrently
  const totalBatches = Math.ceil(packagesToImport.length / BATCH_SIZE);

  console.log(`⚡ Processing ${packagesToImport.length} packages in ${totalBatches} batches of ${BATCH_SIZE}...\n`);

  for (let i = 0; i < packagesToImport.length; i += BATCH_SIZE) {
    const batch = packagesToImport.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    
    console.log(`📦 Batch ${batchNumber}/${totalBatches}: Processing ${batch.length} packages...`);

    // Process batch in parallel
    const results = await Promise.allSettled(
      batch.map(pkg => importPackage(pkg))
    );

    // Count results and check for skips/failures
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const pkg = batch[j];

      if (result.status === 'fulfilled' && result.value === true) {
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
    }

    console.log(`   ✅ ${successCount} imported | ⏭️  ${skipCount} skipped | ❌ ${failCount} failed\n`);

    // Rate limiting between batches (not between individual packages)
    if (i + BATCH_SIZE < packagesToImport.length) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second between batches
    }
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
