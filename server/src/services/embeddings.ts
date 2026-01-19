import { pipeline } from '@xenova/transformers';

// Lazy-load the embedding model (downloads once, ~23MB)
let embeddingPipeline: any = null;

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const EMBEDDING_DIMENSIONS = 384;

/**
 * Initialize the embedding model (lazy loading)
 */
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    console.log('📥 Loading embedding model (first time only, ~23MB)...');
    embeddingPipeline = await pipeline('feature-extraction', MODEL_NAME);
    console.log('✅ Model loaded successfully');
  }
  return embeddingPipeline;
}

/**
 * Generate embedding for a text string using local Transformers.js
 * 100% FREE - No API costs!
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const pipe = await getEmbeddingPipeline();
    
    // Generate embedding
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    
    // Convert to array of numbers
    const embedding = Array.from(output.data) as number[];
    
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * Processes locally - no rate limits!
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  try {
    if (texts.length === 0) {
      return [];
    }

    const pipe = await getEmbeddingPipeline();
    const embeddings: number[][] = [];

    // Process one at a time to avoid memory issues
    // Still fast since it's all local!
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      
      if ((i + 1) % 10 === 0 || i === texts.length - 1) {
        console.log(`Processing: ${i + 1}/${texts.length}...`);
      }
      
      const output = await pipe(text, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data) as number[];
      embeddings.push(embedding);
    }

    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings batch:', error);
    throw error;
  }
}

/**
 * Create searchable text from package data
 * Combines name, description, and key metadata for embedding
 */
export function createPackageText(pkg: {
  name: string;
  description: string;
  readme?: string | null;
  language: string;
  categories?: { name: string }[];
}): string {
  const parts = [
    // Name (most important, repeat for emphasis)
    `Package: ${pkg.name}`,
    
    // Description
    `Description: ${pkg.description}`,
    
    // Language and ecosystem
    `Language: ${pkg.language}`,
    
    // Categories
    pkg.categories && pkg.categories.length > 0
      ? `Categories: ${pkg.categories.map(c => c.name).join(', ')}`
      : '',
    
    // First 500 chars of readme (optional, for richer context)
    pkg.readme
      ? `Details: ${pkg.readme.substring(0, 500)}`
      : '',
  ];

  return parts.filter(Boolean).join('\n');
}

/**
 * Calculate cosine similarity between two vectors
 * Returns a value between -1 and 1 (higher is more similar)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Test embedding generation
 */
export async function testEmbeddingConnection(): Promise<boolean> {
  try {
    console.log('🧪 Testing local embedding model...');
    
    const embedding = await generateEmbedding('test');
    
    if (embedding.length === EMBEDDING_DIMENSIONS) {
      console.log('✅ Embedding model working correctly');
      console.log(`✅ Embedding dimensions: ${embedding.length}`);
      console.log('✅ 100% FREE - No API costs!');
      return true;
    } else {
      console.log(`❌ Unexpected embedding dimensions: ${embedding.length}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Embedding model test failed:', error);
    return false;
  }
}

export { EMBEDDING_DIMENSIONS, MODEL_NAME };
