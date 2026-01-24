import { generateEmbedding, cosineSimilarity } from './embeddings';
import { prisma } from '../lib/prisma';

export interface SemanticSearchResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  language: string;
  stars: number;
  downloads: number;
  githubUrl: string | null;
  registryUrl: string;
  docsUrl: string | null;
  installCommand: string | null;
  similarity: number; // 0-1, higher is more similar
}

/**
 * Semantic search using vector similarity
 * Finds packages based on meaning, not just keywords
 */
export async function semanticSearch(
  query: string,
  options: {
    limit?: number;
    minSimilarity?: number;
    language?: 'PYTHON' | 'NODEJS' | 'RUST';
  } = {}
): Promise<SemanticSearchResult[]> {
  try {
    const {
      limit = 20,
      minSimilarity = 0.3, // Minimum similarity threshold (0-1)
      language,
    } = options;

    // Step 1: Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    // Step 2: Build WHERE clause for filters
    const whereConditions: string[] = ['embedding IS NOT NULL'];
    
    if (language) {
      // Cast the language parameter to the Language enum type
      whereConditions.push(`language = '${language}'::"Language"`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Step 3: Query database with vector similarity
    // Using cosine distance (1 - cosine similarity)
    // Lower distance = more similar
    const results = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id,
        name,
        slug,
        description,
        language,
        stars,
        downloads,
        "githubUrl",
        "registryUrl",
        "docsUrl",
        "installCommand",
        1 - (embedding <=> $1::vector) as similarity
      FROM "Package"
      ${whereClause}
      ORDER BY embedding <=> $1::vector
      LIMIT ${limit}
    `, embeddingString);

    // Step 4: Filter by minimum similarity and format results
    return results
      .filter(r => r.similarity >= minSimilarity)
      .map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        language: r.language,
        stars: Number(r.stars),
        downloads: Number(r.downloads),
        githubUrl: r.githubUrl,
        registryUrl: r.registryUrl,
        docsUrl: r.docsUrl,
        installCommand: r.installCommand,
        similarity: Number(r.similarity),
      }));
  } catch (error) {
    console.error('Error in semantic search:', error);
    throw error;
  }
}

/**
 * Hybrid search: Combines semantic search with keyword matching
 * Provides best of both worlds
 */
export async function hybridSearch(
  query: string,
  options: {
    limit?: number;
    language?: 'PYTHON' | 'NODEJS' | 'RUST';
  } = {}
): Promise<SemanticSearchResult[]> {
  try {
    const { limit = 20, language } = options;

    // Get semantic results (60% of limit)
    const semanticLimit = Math.ceil(limit * 0.6);
    const semanticResults = await semanticSearch(query, {
      limit: semanticLimit,
      language,
      minSimilarity: 0.2, // Lower threshold for hybrid
    });

    // Get keyword results (40% of limit)
    const keywordLimit = Math.ceil(limit * 0.4);
    const keywordResults = await prisma.package.findMany({
      where: {
        AND: [
          language ? { language } : {},
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        language: true,
        stars: true,
        downloads: true,
        githubUrl: true,
        registryUrl: true,
        docsUrl: true,
        installCommand: true,
      },
      orderBy: [
        { stars: 'desc' },
      ],
      take: keywordLimit,
    });

    // Combine and deduplicate results
    const seenIds = new Set<string>();
    const combined: SemanticSearchResult[] = [];

    // Add semantic results first (they're usually better)
    for (const result of semanticResults) {
      if (!seenIds.has(result.id)) {
        combined.push(result);
        seenIds.add(result.id);
      }
    }

    // Add keyword results
    for (const result of keywordResults) {
      if (!seenIds.has(result.id)) {
        combined.push({
          ...result,
          similarity: 0.5, // Give keyword matches a default similarity
        });
        seenIds.add(result.id);
      }
    }

    // Sort by similarity (semantic results will naturally rank higher)
    combined.sort((a, b) => b.similarity - a.similarity);

    return combined.slice(0, limit);
  } catch (error) {
    console.error('Error in hybrid search:', error);
    throw error;
  }
}
