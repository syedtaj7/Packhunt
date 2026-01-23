import { PrismaClient, Language } from '@prisma/client';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { DiscoveredPackage } from './auto-discover-packages';

const prisma = new PrismaClient();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const headers = GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {};

// Language mapping
const languageMap: Record<string, string> = {
  nodejs: 'NODEJS',
  python: 'PYTHON',
  rust: 'RUST',
  go: 'GO',
  java: 'JAVA',
  csharp: 'CSHARP',
  ruby: 'RUBY',
  php: 'PHP',
  swift: 'SWIFT',
  kotlin: 'KOTLIN',
  dart: 'DART',
  elixir: 'ELIXIR',
  haskell: 'HASKELL',
  scala: 'SCALA',
  cpp: 'CPP',
  r: 'R',
  julia: 'JULIA',
};

async function importDiscoveredPackages() {
  console.log('🤖 IMPORTING DISCOVERED PACKAGES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Read discovered packages file
  const discoveredPath = path.join(__dirname, '../../../data/discovered-packages.json');
  
  if (!fs.existsSync(discoveredPath)) {
    console.error('❌ No discovered packages file found!');
    console.log('💡 Run: npm run discover first\n');
    process.exit(1);
  }

  const discoveredPackages: DiscoveredPackage[] = JSON.parse(
    fs.readFileSync(discoveredPath, 'utf-8')
  );

  console.log(`📦 Found ${discoveredPackages.length} discovered packages to import\n`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;
  const failedPackages: string[] = [];
  const skippedPackages: string[] = [];

  // Process in batches for speed
  const BATCH_SIZE = 15;
  const totalBatches = Math.ceil(discoveredPackages.length / BATCH_SIZE);

  console.log(`⚡ Processing in ${totalBatches} batches of ${BATCH_SIZE}...\n`);

  for (let i = 0; i < discoveredPackages.length; i += BATCH_SIZE) {
    const batch = discoveredPackages.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    
    console.log(`📦 Batch ${batchNumber}/${totalBatches}: Processing ${batch.length} packages...`);

    const results = await Promise.allSettled(
      batch.map(pkg => importPackage(pkg))
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const pkg = batch[j];

      if (result.status === 'fulfilled' && result.value === true) {
        successCount++;
      } else {
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

    if (i + BATCH_SIZE < discoveredPackages.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ Import Complete!\n');
  console.log(`✅ Successfully imported: ${successCount} packages`);
  console.log(`⏭️  Skipped (already exist): ${skipCount} packages`);
  console.log(`❌ Failed: ${failCount} packages\n`);

  if (skipCount > 0) {
    console.log('⏭️  Skipped packages (sample):');
    skippedPackages.slice(0, 5).forEach(pkg => console.log(`   - ${pkg}`));
    if (skippedPackages.length > 5) {
      console.log(`   ... and ${skippedPackages.length - 5} more\n`);
    }
  }

  if (failCount > 0) {
    console.log('❌ Failed packages (sample):');
    failedPackages.slice(0, 10).forEach(pkg => console.log(`   - ${pkg}`));
    if (failedPackages.length > 10) {
      console.log(`   ... and ${failedPackages.length - 10} more\n`);
    }
  }

  // Show database stats
  const total = await prisma.package.count();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📊 Total packages in database: ${total}\n`);
  console.log('✅ Done! Run these next:');
  console.log('   1. npm run meilisearch:sync');
  console.log('   2. npx tsx src/scripts/generate-embeddings.ts\n');
}

async function importPackage(pkg: DiscoveredPackage): Promise<boolean> {
  try {
    // Check if already exists
    const existing = await prisma.package.findUnique({
      where: { slug: pkg.name.toLowerCase() },
    });

    if (existing) {
      return false;
    }

    // Fetch GitHub data
    const githubResponse = await axios.get(
      `https://api.github.com/repos/${pkg.githubRepo}`,
      { headers, timeout: 10000 }
    );
    const repoData = githubResponse.data;

    // Fetch registry-specific data
    let downloads = 0;
    if (pkg.ecosystem === 'npm') {
      try {
        const npmResponse = await axios.get(
          `https://api.npmjs.org/downloads/point/last-month/${pkg.name}`,
          { timeout: 5000 }
        );
        downloads = npmResponse.data.downloads || 0;
      } catch {
        downloads = repoData.stargazers_count * 100;
      }
    } else if (pkg.ecosystem === 'pypi') {
      try {
        const pypiResponse = await axios.get(
          `https://pypistats.org/api/packages/${pkg.name}/recent`,
          { timeout: 5000 }
        );
        downloads = pypiResponse.data.data?.last_month || 0;
      } catch {
        downloads = repoData.stargazers_count * 50;
      }
    } else {
      downloads = repoData.stargazers_count * 100;
    }

    // Create package
    await prisma.package.create({
      data: {
        name: pkg.name,
        slug: pkg.name.toLowerCase(),
        description: repoData.description || `${pkg.name} package`,
        language: (languageMap[pkg.language] || 'NODEJS') as Language,
        ecosystem: pkg.ecosystem,
        githubUrl: `https://github.com/${pkg.githubRepo}`,
        stars: repoData.stargazers_count || 0,
        forks: repoData.forks_count || 0,
        downloads: Math.round(downloads),
        license: repoData.license?.name || 'MIT',
        registryUrl: pkg.ecosystem === 'npm' ? `https://www.npmjs.com/package/${pkg.name}` : pkg.ecosystem === 'pypi' ? `https://pypi.org/project/${pkg.name}/` : '',
        readme: repoData.description || '',
        installCommand: pkg.ecosystem === 'npm' ? `npm install ${pkg.name}` : pkg.ecosystem === 'pypi' ? `pip install ${pkg.name}` : '',
        lastUpdated: new Date(repoData.updated_at || Date.now()),
        categories: {
          connectOrCreate: pkg.categories.slice(0, 3).map(cat => ({
            where: { name: cat },
            create: { name: cat, slug: cat.toLowerCase().replace(/\s+/g, '-') },
          })),
        },
      },
    });

    console.log(`  ✅ Successfully imported ${pkg.name}`);
    return true;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number }; message?: string };
    if (err.response?.status === 404) {
      console.log(`  ⚠️  GitHub repo not found: ${pkg.githubRepo}`);
    } else {
      console.log(`  ❌ Failed to import ${pkg.name}: ${err.message || 'Unknown error'}`);
    }
    return false;
  }
}

if (require.main === module) {
  importDiscoveredPackages()
    .catch((e) => {
      console.error('❌ Import failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
