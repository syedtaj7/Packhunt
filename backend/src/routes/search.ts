import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { searchPackages as meilisearchSearchPackages, checkMeilisearchHealth } from '../services/meilisearch';
import { semanticSearch, hybridSearch } from '../services/semantic-search';

const router = Router();

// GET /api/search?q=numpy&language=python&minStars=1000&license=MIT
router.get('/', async (req, res) => {
  try {
    const { q, language, minStars, license, limit = '50', page = '1', sortBy = 'relevance' } = req.query;

    if (!q && !language) {
      return res.json({ 
        data: [], 
        pagination: { total: 0, page: 1, limit: 50, totalPages: 0 }
      });
    }

    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {
      AND: [],
    };

    // Add text search if query exists
    if (q) {
      const searchQuery = q as string;
      whereClause.AND.push({
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { slug: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { readme: { contains: searchQuery, mode: 'insensitive' } },
        ],
      });
    }

    // Add filters
    if (language && language !== 'all') {
      whereClause.AND.push({ language: language as any });
    }
    if (minStars) {
      whereClause.AND.push({ stars: { gte: parseInt(minStars as string) } });
    }
    if (license && license !== 'all') {
      whereClause.AND.push({ license: license as string });
    }

    // Determine sort order
    let orderBy: any;
    switch (sortBy) {
      case 'stars':
        orderBy = { stars: 'desc' };
        break;
      case 'downloads':
        orderBy = { downloads: 'desc' };
        break;
      case 'recent':
        orderBy = { lastUpdated: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'relevance':
      default:
        // For relevance, we'll sort by popularity score but prioritize name matches
        orderBy = { popularityScore: 'desc' };
        break;
    }

    const packages = await prisma.package.findMany({
      where: whereClause.AND.length > 0 ? whereClause : undefined,
      include: {
        categories: true,
        _count: {
          select: {
            examples: true,
            alternatives: true,
          },
        },
      },
      orderBy,
      take: limitNum,
      skip,
    });

    // If searching by text, boost results where query matches the name
    let sortedPackages = packages;
    if (q && sortBy === 'relevance') {
      const searchTerm = (q as string).toLowerCase();
      sortedPackages = packages.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().includes(searchTerm);
        const bNameMatch = b.name.toLowerCase().includes(searchTerm);
        const aSlugMatch = a.slug.toLowerCase().includes(searchTerm);
        const bSlugMatch = b.slug.toLowerCase().includes(searchTerm);
        
        // Name exact match > slug match > description match > popularity
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        if (aSlugMatch && !bSlugMatch) return -1;
        if (!aSlugMatch && bSlugMatch) return 1;
        
        // Fall back to popularity
        return b.popularityScore - a.popularityScore;
      });
    }

    const total = await prisma.package.count({
      where: whereClause.AND.length > 0 ? whereClause : undefined,
    });

    res.json({ 
      data: sortedPackages, 
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
    console.error('Error searching packages:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/search/meilisearch - Search using Meilisearch (with typo tolerance)
router.get('/meilisearch', async (req, res) => {
  try {
    const { q, language, minStars, license, limit = '20', page = '1', sortBy } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const offset = (pageNum - 1) * limitNum;

    // Build filter string for Meilisearch
    const filters: string[] = [];
    if (language && language !== 'all') {
      filters.push(`language = ${language}`);
    }
    if (minStars) {
      filters.push(`stars >= ${minStars}`);
    }
    if (license && license !== 'all') {
      filters.push(`license = "${license}"`);
    }

    // Build sort array
    const sort: string[] = [];
    if (sortBy) {
      const sortByStr = sortBy as string;
      switch (sortByStr) {
        case 'stars':
          sort.push('stars:desc');
          break;
        case 'downloads':
          sort.push('downloads:desc');
          break;
        case 'recent':
          sort.push('lastUpdated:desc');
          break;
        case 'name':
          sort.push('name:asc');
          break;
        // 'relevance' is default (no sort needed)
      }
    }

    // Search with Meilisearch
    const results = await meilisearchSearchPackages(q as string, {
      filter: filters.length > 0 ? filters.join(' AND ') : undefined,
      sort: sort.length > 0 ? sort : undefined,
      limit: limitNum,
      offset,
    });

    // Transform results to match our API format
    const data = results.hits.map((hit: any) => ({
      id: hit.id,
      name: hit.name,
      slug: hit.slug,
      description: hit.description,
      language: hit.language,
      ecosystem: hit.ecosystem,
      stars: hit.stars,
      downloads: hit.downloads,
      forks: hit.forks,
      license: hit.license,
      lastUpdated: new Date(hit.lastUpdated).toISOString(),
      popularityScore: hit.popularityScore,
      githubUrl: hit.githubUrl,
      registryUrl: hit.registryUrl,
      docsUrl: hit.docsUrl,
      homepageUrl: hit.homepageUrl,
      installCommand: hit.installCommand,
      categories: hit.categories ? hit.categories.map((name: string) => ({ name })) : [],
      _highlighted: hit._formatted, // Include highlighted results
    }));

    res.json({
      data,
      pagination: {
        total: results.estimatedTotalHits,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(results.estimatedTotalHits / limitNum),
      },
      meta: {
        processingTimeMs: results.processingTimeMs,
        query: results.query,
      },
    });
  } catch (error) {
    console.error('Error searching with Meilisearch:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/search/health - Check Meilisearch health
router.get('/health', async (req, res) => {
  try {
    const health = await checkMeilisearchHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// GET /api/search/semantic - Semantic search using vector embeddings (100% FREE!)
router.get('/semantic', async (req, res) => {
  try {
    const { q, language, limit = '20' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const limitNum = parseInt(limit as string);

    const results = await semanticSearch(q as string, {
      limit: limitNum,
      language: language as any,
      minSimilarity: 0.3,
    });

    res.json({
      data: results,
      meta: {
        query: q,
        count: results.length,
        searchType: 'semantic',
        powered: 'Local AI (100% FREE)',
      },
    });
  } catch (error) {
    console.error('Error in semantic search:', error);
    res.status(500).json({ error: 'Semantic search failed' });
  }
});

// GET /api/search/hybrid - Hybrid search (semantic + keyword) - BEST RESULTS!
router.get('/hybrid', async (req, res) => {
  try {
    const { q, language, limit = '20' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const limitNum = parseInt(limit as string);

    const results = await hybridSearch(q as string, {
      limit: limitNum,
      language: language as any,
    });

    res.json({
      data: results,
      meta: {
        query: q,
        count: results.length,
        searchType: 'hybrid',
        powered: 'Local AI + Meilisearch (100% FREE)',
      },
    });
  } catch (error) {
    console.error('Error in hybrid search:', error);
    res.status(500).json({ error: 'Hybrid search failed' });
  }
});

export default router;
