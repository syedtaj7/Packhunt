/**
 * API Client for Package Compass Backend
 * Base URL: http://localhost:3001/api
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

// Types matching our Prisma schema
export interface Package {
  id: string;
  name: string;
  slug: string;
  description: string;
  language: 'PYTHON' | 'NODEJS' | 'RUST' | 'GO' | 'JAVA' | 'CSHARP' | 'RUBY' | 'PHP' | 'SWIFT' | 'KOTLIN' | 'DART' | 'ELIXIR' | 'HASKELL' | 'SCALA' | 'CPP' | 'R' | 'JULIA';
  ecosystem: string; // "pypi", "npm", "crates.io", etc.
  installCommand: string;
  githubUrl: string;
  registryUrl: string;
  docsUrl?: string;
  homepageUrl?: string;
  stars: number;
  forks: number;
  downloads?: number;
  license?: string;
  readme?: string;
  lastUpdated: string;
  popularityScore: number;
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
  examples?: Example[];
  alternatives?: Package[];
  dependencies?: Dependency[];
  _count?: {
    examples: number;
    alternatives: number;
    dependencies: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  _count?: {
    packages: number;
  };
}

export interface Example {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  packageId: string;
}

export interface Dependency {
  id: string;
  name: string;
  version?: string;
  isDevDependency: boolean;
  packageId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SearchParams {
  q?: string;
  language?: 'PYTHON' | 'NODEJS' | 'RUST';
  minStars?: number;
  license?: string;
  sortBy?: 'relevance' | 'stars' | 'downloads' | 'recent' | 'name';
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface PackageListParams {
  language?: 'PYTHON' | 'NODEJS' | 'RUST';
  sortBy?: 'stars' | 'forks' | 'downloads' | 'recent' | 'name';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface PackageStats {
  total: number;
  byLanguage: {
    python: number;
    nodejs: number;
    rust: number;
  };
  totalStars: number;
  totalDownloads: number;
}

// Helper function to build query strings
function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

// ============================================================================
// PACKAGES API
// ============================================================================

/**
 * Get list of packages with optional filters and pagination
 */
export async function getPackages(params?: PackageListParams): Promise<PaginatedResponse<Package>> {
  const queryString = buildQueryString(params || {});
  return fetchAPI<PaginatedResponse<Package>>(`/packages${queryString}`);
}

/**
 * Get a single package by slug with all related data
 */
export async function getPackageBySlug(slug: string): Promise<Package> {
  return fetchAPI<Package>(`/packages/${slug}`);
}

/**
 * Get trending packages (recently popular)
 */
export async function getTrendingPackages(limit: number = 10): Promise<{ data: Package[] }> {
  return fetchAPI<{ data: Package[] }>(`/packages/trending?limit=${limit}`);
}

/**
 * Get package statistics
 */
export async function getPackageStats(): Promise<PackageStats> {
  return fetchAPI<PackageStats>('/packages/stats');
}

// ============================================================================
// SEARCH API
// ============================================================================

/**
 * Search packages by query with filters
 * Uses Meilisearch for typo-tolerant, fuzzy search
 */
export async function searchPackages(params: SearchParams): Promise<PaginatedResponse<Package>> {
  const queryString = buildQueryString(params);
  return fetchAPI<PaginatedResponse<Package>>(`/search/meilisearch${queryString}`);
}

/**
 * Search packages using Prisma (fallback/legacy)
 */
export async function searchPackagesPrisma(params: SearchParams): Promise<PaginatedResponse<Package>> {
  const queryString = buildQueryString(params);
  return fetchAPI<PaginatedResponse<Package>>(`/search${queryString}`);
}

/**
 * Search packages using semantic search (natural language queries)
 * Powered by local AI embeddings (100% free)
 */
export async function searchPackagesSemantic(params: SearchParams): Promise<PaginatedResponse<Package & { similarity?: number }>> {
  const queryString = buildQueryString(params);
  return fetchAPI<PaginatedResponse<Package & { similarity?: number }>>(`/search/semantic${queryString}`);
}

/**
 * Search packages using hybrid search (semantic + keyword)
 * Best results combining AI understanding with exact matching
 */
export async function searchPackagesHybrid(params: SearchParams): Promise<PaginatedResponse<Package & { similarity?: number }>> {
  const queryString = buildQueryString(params);
  return fetchAPI<PaginatedResponse<Package & { similarity?: number }>>(`/search/hybrid${queryString}`);
}

// ============================================================================
// CATEGORIES API
// ============================================================================

/**
 * Get all categories with package counts
 */
export async function getCategories(): Promise<Category[]> {
  return fetchAPI<Category[]>('/categories');
}

/**
 * Get packages in a specific category
 */
export async function getPackagesByCategory(
  slug: string,
  params?: { page?: number; limit?: number }
): Promise<PaginatedResponse<Package>> {
  const queryString = buildQueryString(params || {});
  return fetchAPI<PaginatedResponse<Package>>(`/categories/${slug}/packages${queryString}`);
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Check if API is healthy
 */
export async function checkHealth(): Promise<{ status: string; timestamp: string; database: string }> {
  const API_ROOT = API_BASE_URL.replace('/api', '');
  return fetchAPI<{ status: string; timestamp: string; database: string }>('/health', {
    signal: AbortSignal.timeout(5000), // 5 second timeout
  }).catch(() => {
    // Fallback if health endpoint fails
    return { status: 'error', timestamp: new Date().toISOString(), database: 'disconnected' };
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert backend language enum to frontend display format
 */
export function formatLanguage(language: Package['language']): string {
  const languageMap = {
    PYTHON: 'Python',
    NODEJS: 'Node.js',
    RUST: 'Rust',
  };
  return languageMap[language] || language;
}

/**
 * Format star count (e.g., 12345 -> 12.3k)
 */
export function formatStars(stars: number): string {
  if (stars >= 1000000) {
    return `${(stars / 1000000).toFixed(1)}M`;
  }
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`;
  }
  return stars.toString();
}

/**
 * Format download count
 */
export function formatDownloads(downloads?: number): string {
  if (!downloads) return 'N/A';
  if (downloads >= 1000000) {
    return `${(downloads / 1000000).toFixed(1)}M`;
  }
  if (downloads >= 1000) {
    return `${(downloads / 1000).toFixed(1)}k`;
  }
  return downloads.toString();
}

/**
 * Get package registry URL based on language
 */
export function getRegistryUrl(pkg: Package): string {
  return pkg.registryUrl || pkg.githubUrl;
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
