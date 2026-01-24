import { PrismaClient } from '@prisma/client';
import { generateEmbeddingsBatch, createPackageText, testEmbeddingConnection } from '../services/embeddings';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting embedding generation...\n');
    
    // Step 1: Test embedding model
    console.log('Step 1: Testing local embedding model');
    const isConnected = await testEmbeddingConnection();
    if (!isConnected) {
      throw new Error('Embedding model test failed.');
    }
    console.log('');
    
    // Step 2: Fetch packages without embeddings
    console.log('Step 2: Fetching packages from database');
    const packages = await prisma.package.findMany({
      include: {
        categories: true,
      },
      // Optional: only fetch packages without embeddings
      // where: {
      //   embeddingAt: null,
      // },
    });
    console.log(`✅ Found ${packages.length} packages to process\n`);
    
    if (packages.length === 0) {
      console.log('✅ All packages already have embeddings!');
      return;
    }
    
    // Step 3: Create searchable texts
    console.log('Step 3: Preparing package texts');
    const packageTexts = packages.map(pkg => createPackageText(pkg));
    console.log(`✅ Created ${packageTexts.length} package descriptions\n`);
    
    // Step 4: Generate embeddings
    console.log('Step 4: Generating embeddings locally (100% FREE!)');
    console.log('⏳ This may take a moment...');
    const embeddings = await generateEmbeddingsBatch(packageTexts);
    console.log(`✅ Generated ${embeddings.length} embeddings\n`);
    
    // Step 5: Save embeddings to database
    console.log('Step 5: Saving embeddings to database');
    let savedCount = 0;
    
    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      const embedding = embeddings[i];
      
      // Convert embedding array to string format for Postgres
      // Format: [0.1, 0.2, 0.3, ...]
      const embeddingString = `[${embedding.join(',')}]`;
      
      await prisma.$executeRaw`
        UPDATE "Package"
        SET embedding = ${embeddingString}::vector,
            "embeddingAt" = NOW()
        WHERE id = ${pkg.id}
      `;
      
      savedCount++;
      
      if ((i + 1) % 10 === 0 || i === packages.length - 1) {
        console.log(`  Progress: ${i + 1}/${packages.length} packages`);
      }
    }
    
    console.log(`✅ Saved ${savedCount} embeddings\n`);
    
    // Step 6: Verify embeddings
    console.log('Step 6: Verifying embeddings');
    const packagesWithEmbeddings = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM "Package"
      WHERE embedding IS NOT NULL
    `;
    
    const count = Number(packagesWithEmbeddings[0].count);
    console.log(`📊 Packages with embeddings: ${count}/${packages.length}`);
    console.log('');
    
    console.log('✅ Embedding generation complete!');
    console.log('\n🔍 You can now use semantic search');
    console.log('Example: curl "http://localhost:3001/api/search/semantic?q=fast+web+framework"');
    
  } catch (error) {
    console.error('❌ Embedding generation failed:', error);
    
    if (error instanceof Error) {
      console.log('\n💡 Tip: Make sure Transformers.js is installed:');
      console.log('   bun add @xenova/transformers');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
