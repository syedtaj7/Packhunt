import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/packages/trending - Get trending packages
router.get('/trending', async (req, res) => {
  try {
    const { limit = '10' } = req.query;
    
    // Trending = high stars + recent updates
    // Simple algorithm: packages with good popularity and recent activity
    const packages = await prisma.package.findMany({
      where: {
        stars: { gte: 1000 }, // At least 1k stars
      },
      include: {
        categories: true,
        _count: {
          select: { 
            examples: true, 
            alternatives: true 
          }
        }
      },
      orderBy: [
        { lastUpdated: 'desc' }, // Most recently updated
        { popularityScore: 'desc' }, // Then by popularity
      ],
      take: parseInt(limit as string),
    });

    res.json({ data: packages });
  } catch (error) {
    console.error('Error fetching trending packages:', error);
    // Send more detailed error in development
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to fetch trending packages',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

// GET /api/packages/stats - Get package statistics
router.get('/stats', async (req, res) => {
  try {
    const total = await prisma.package.count();
    
    const byLanguage = await Promise.all([
      prisma.package.count({ where: { language: 'PYTHON' } }),
      prisma.package.count({ where: { language: 'NODEJS' } }),
      prisma.package.count({ where: { language: 'RUST' } }),
    ]);

    const totalStars = await prisma.package.aggregate({
      _sum: { stars: true },
    });

    const totalDownloads = await prisma.package.aggregate({
      _sum: { downloads: true },
    });

    res.json({
      total,
      byLanguage: {
        python: byLanguage[0],
        nodejs: byLanguage[1],
        rust: byLanguage[2],
      },
      totalStars: totalStars._sum.stars || 0,
      totalDownloads: totalDownloads._sum.downloads || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

// GET /api/packages - List all packages with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      language, 
      limit = '50', 
      offset = '0',
      sortBy = 'stars',
      order = 'desc'
    } = req.query;

    // Determine sort field and order
    let orderByClause: any;
    switch (sortBy as string) {
      case 'stars':
        orderByClause = { stars: order };
        break;
      case 'downloads':
        orderByClause = { downloads: order };
        break;
      case 'recent':
        orderByClause = { lastUpdated: 'desc' };
        break;
      case 'name':
        orderByClause = { name: order };
        break;
      case 'forks':
        orderByClause = { forks: order };
        break;
      default:
        orderByClause = { stars: 'desc' };
    }

    const packages = await prisma.package.findMany({
      where: language && language !== 'all' ? { language: language as any } : undefined,
      include: {
        categories: true,
        _count: {
          select: { 
            examples: true, 
            alternatives: true 
          }
        }
      },
      orderBy: orderByClause,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.package.count({
      where: language && language !== 'all' ? { language: language as any } : undefined,
    });

    res.json({ 
      data: packages, 
      pagination: {
        total, 
        page: Math.floor(parseInt(offset as string) / parseInt(limit as string)) + 1,
        limit: parseInt(limit as string), 
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// GET /api/packages/:slug - Get single package with all details
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const pkg = await prisma.package.findUnique({
      where: { slug },
      include: {
        categories: true,
        examples: { 
          orderBy: { order: 'asc' } 
        },
        alternatives: {
          include: {
            alternative: {
              include: {
                categories: true
              }
            }
          }
        },
        dependencies: true,
      },
    });

    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json(pkg);
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({ error: 'Failed to fetch package details' });
  }
});

export default router;
