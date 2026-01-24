import { MeiliSearch } from 'meilisearch';
import type { Package, Category } from '@prisma/client';

// Initialize Meilisearch client
const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_MASTER_KEY || 'MASTER_KEY_DEV_MODE',
});

const INDEX_NAME = 'packages';

// Package document structure for Meilisearch
export interface MeiliPackageDocument {
  id: string;
  name: string;
  slug: string;
  description: string;
  readme: string;
  language: string;
  ecosystem: string;
  stars: number;
  downloads: number;
  forks: number;
  license: string | null;
  categories: string[]; // Category names for easy filtering
  categoryIds: string[]; // Category IDs for filtering
  lastUpdated: number; // Unix timestamp for sorting
  popularityScore: number;
  githubUrl: string | null;
  registryUrl: string | null;
  docsUrl: string | null;
  homepageUrl: string | null;
  installCommand: string | null;
}

/**
 * Initialize Meilisearch index with proper configuration
 */
export async function initializeMeilisearch() {
  try {
    console.log('🔍 Initializing Meilisearch...');
    
    // Check if Meilisearch is accessible
    const health = await client.health();
    console.log('✅ Meilisearch is healthy:', health);
    
    // Get or create index
    const index = client.index(INDEX_NAME);
    
    try {
      // Try to get index stats (will throw if doesn't exist)
      await index.getStats();
      console.log('📦 Index already exists');
    } catch (error) {
      // Index doesn't exist, it will be created on first document addition
      console.log('📦 Index will be created on first document addition');
    }
    
    // Configure searchable attributes (in order of importance)
    await index.updateSearchableAttributes([
      'name',
      'slug',
      'description',
      'readme',
      'categories',
    ]);
    
    // Configure filterable attributes
    await index.updateFilterableAttributes([
      'language',
      'license',
      'stars',
      'downloads',
      'categories',
      'categoryIds',
    ]);
    
    // Configure sortable attributes
    await index.updateSortableAttributes([
      'stars',
      'downloads',
      'lastUpdated',
      'name',
      'popularityScore',
    ]);
    
    // Configure ranking rules (order matters!)
    await index.updateRankingRules([
      'words',      // Match all query words
      'typo',       // Allow typos (closer typos rank higher)
      'proximity',  // Closer words rank higher
      'attribute',  // Earlier attributes rank higher
      'sort',       // Apply sort
      'exactness',  // Exact matches rank higher
    ]);
    
    // Configure typo tolerance
    await index.updateTypoTolerance({
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 4,   // Allow 1 typo for words with 4+ characters
        twoTypos: 8,  // Allow 2 typos for words with 8+ characters
      },
      disableOnWords: [], // No words excluded from typo tolerance
      disableOnAttributes: [], // No attributes excluded
    });
    
    console.log('✅ Meilisearch index configured successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Meilisearch:', error);
    return false;
  }
}

/**
 * Transform Prisma package to Meilisearch document
 */
export function transformPackageToDocument(
  pkg: Package & { categories: Category[] }
): MeiliPackageDocument {
  return {
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
    description: pkg.description,
    readme: pkg.readme || '',
    language: pkg.language,
    ecosystem: pkg.ecosystem,
    stars: pkg.stars,
    downloads: pkg.downloads,
    forks: pkg.forks,
    license: pkg.license,
    categories: pkg.categories.map((c) => c.name),
    categoryIds: pkg.categories.map((c) => c.id),
    lastUpdated: new Date(pkg.lastUpdated).getTime(),
    popularityScore: pkg.popularityScore,
    githubUrl: pkg.githubUrl,
    registryUrl: pkg.registryUrl,
    docsUrl: pkg.docsUrl,
    homepageUrl: pkg.homepageUrl,
    installCommand: pkg.installCommand,
  };
}

/**
 * Add or update packages in Meilisearch
 */
export async function syncPackagesToMeilisearch(
  packages: (Package & { categories: Category[] })[]
) {
  try {
    console.log(`📦 Syncing ${packages.length} packages to Meilisearch...`);
    
    const index = client.index(INDEX_NAME);
    const documents = packages.map(transformPackageToDocument);
    
    // Add or update documents (returns a task)
    await index.addDocuments(documents, { primaryKey: 'id' });
    
    // Note: Documents are indexed asynchronously
    // For production, you might want to wait for the task to complete
    // but for development, we'll let it process in the background
    
    console.log(`✅ Successfully queued ${packages.length} packages for indexing`);
    return true;
  } catch (error) {
    console.error('❌ Error syncing packages to Meilisearch:', error);
    throw error;
  }
}

/**
 * Search packages using Meilisearch
 */
export async function searchPackages(
  query: string,
  options: {
    filter?: string;
    sort?: string[];
    limit?: number;
    offset?: number;
  } = {}
) {
  try {
    const index = client.index(INDEX_NAME);
    
    const searchResults = await index.search(query, {
      filter: options.filter,
      sort: options.sort,
      limit: options.limit || 20,
      offset: options.offset || 0,
      attributesToHighlight: ['name', 'description'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });
    
    return searchResults;
  } catch (error) {
    console.error('❌ Error searching packages in Meilisearch:', error);
    throw error;
  }
}

/**
 * Delete a package from Meilisearch
 */
export async function deletePackageFromMeilisearch(packageId: string) {
  try {
    const index = client.index(INDEX_NAME);
    await index.deleteDocument(packageId);
    console.log(`✅ Deleted package ${packageId} from Meilisearch`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting package from Meilisearch:', error);
    throw error;
  }
}

/**
 * Check Meilisearch health
 */
export async function checkMeilisearchHealth() {
  try {
    const health = await client.health();
    return { isHealthy: true, ...health };
  } catch (error) {
    return { isHealthy: false, error: (error as Error).message };
  }
}

/**
 * Get index stats
 */
export async function getIndexStats() {
  try {
    const index = client.index(INDEX_NAME);
    const stats = await index.getStats();
    return stats;
  } catch (error) {
    console.error('❌ Error getting index stats:', error);
    throw error;
  }
}

export { client };
