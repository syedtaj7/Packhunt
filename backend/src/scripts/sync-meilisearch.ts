import { PrismaClient } from '@prisma/client';
import { initializeMeilisearch, syncPackagesToMeilisearch, getIndexStats } from '../services/meilisearch';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting Meilisearch sync...\n');
    
    // Step 1: Initialize Meilisearch
    console.log('Step 1: Initializing Meilisearch');
    const initialized = await initializeMeilisearch();
    if (!initialized) {
      throw new Error('Failed to initialize Meilisearch');
    }
    console.log('');
    
    // Step 2: Fetch all packages from database
    console.log('Step 2: Fetching packages from database');
    const packages = await prisma.package.findMany({
      include: {
        categories: true,
      },
    });
    console.log(`✅ Found ${packages.length} packages in database\n`);
    
    // Step 3: Sync to Meilisearch
    console.log('Step 3: Syncing to Meilisearch');
    await syncPackagesToMeilisearch(packages);
    console.log('');
    
    // Step 4: Verify sync
    console.log('Step 4: Verifying sync');
    const stats = await getIndexStats();
    console.log('📊 Index stats:', {
      numberOfDocuments: stats.numberOfDocuments,
      isIndexing: stats.isIndexing,
    });
    console.log('');
    
    console.log('✅ Sync completed successfully!');
    console.log('\n🔍 You can now search packages via Meilisearch');
    console.log('📍 Dashboard: http://localhost:7700');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
