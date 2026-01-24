/**
 * React Query hooks for fetching data from the API
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  getPackages,
  getPackageBySlug,
  searchPackages,
  searchPackagesSemantic,
  searchPackagesHybrid,
  getCategories,
  getPackagesByCategory,
  getTrendingPackages,
  getPackageStats,
  checkHealth,
  Package,
  Category,
  PaginatedResponse,
  PackageStats,
  SearchParams,
  PackageListParams,
} from '@/lib/api';

// ============================================================================
// PACKAGES HOOKS
// ============================================================================

/**
 * Hook to fetch packages with filters and pagination
 */
export function usePackages(params?: PackageListParams, enabled: boolean = true) {
  return useQuery<PaginatedResponse<Package>>({
    queryKey: ['packages', params],
    queryFn: () => getPackages(params),
    enabled: enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single package by slug
 */
export function usePackage(slug: string | undefined) {
  return useQuery<Package>({
    queryKey: ['package', slug],
    queryFn: () => {
      if (!slug) throw new Error('Slug is required');
      return getPackageBySlug(slug);
    },
    enabled: !!slug, // Only run query if slug exists
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// SEARCH HOOKS
// ============================================================================

/**
 * Hook to search packages
 */
export function useSearchPackages(params: SearchParams, enabled: boolean = true) {
  const finalEnabled = enabled && (!!params.q || !!params.language);
  
  return useQuery<PaginatedResponse<Package>>({
    queryKey: ['search', params],
    queryFn: () => searchPackages(params),
    enabled: finalEnabled,
    staleTime: 1000 * 60 * 2, // 2 minutes for search results
  });
}

/**
 * Hook to search packages using semantic search (natural language)
 */
export function useSearchPackagesSemantic(params: SearchParams, enabled: boolean = true) {
  const finalEnabled = enabled && !!params.q;
  
  return useQuery<PaginatedResponse<Package & { similarity?: number }>>({
    queryKey: ['search-semantic', params],
    queryFn: () => searchPackagesSemantic(params),
    enabled: finalEnabled,
    staleTime: 1000 * 60 * 2, // 2 minutes for search results
  });
}

/**
 * Hook to search packages using hybrid search (semantic + keyword)
 */
export function useSearchPackagesHybrid(params: SearchParams, enabled: boolean = true) {
  const finalEnabled = enabled && !!params.q;
  
  return useQuery<PaginatedResponse<Package & { similarity?: number }>>({
    queryKey: ['search-hybrid', params],
    queryFn: () => searchPackagesHybrid(params),
    enabled: finalEnabled,
    staleTime: 1000 * 60 * 2, // 2 minutes for search results
  });
}

// ============================================================================
// CATEGORIES HOOKS
// ============================================================================

/**
 * Hook to fetch all categories
 */
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes (categories change rarely)
  });
}

/**
 * Hook to fetch packages by category
 */
export function useCategoryPackages(
  slug: string | undefined,
  params?: { page?: number; limit?: number }
) {
  return useQuery<PaginatedResponse<Package>>({
    queryKey: ['category-packages', slug, params],
    queryFn: () => {
      if (!slug) throw new Error('Category slug is required');
      return getPackagesByCategory(slug, params);
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// HEALTH CHECK HOOK
// ============================================================================

/**
 * Hook to check API health status
 */
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
    retry: 3,
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to get featured packages (most starred)
 */
export function useFeaturedPackages(limit: number = 6) {
  return useQuery<PaginatedResponse<Package>>({
    queryKey: ['featured-packages', limit],
    queryFn: () => getPackages({ sortBy: 'stars', limit }),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to get trending packages (recently popular)
 */
export function useTrendingPackages(limit: number = 10) {
  return useQuery<{ data: Package[] }>({
    queryKey: ['trending-packages', limit],
    queryFn: () => getTrendingPackages(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get package statistics
 */
export function usePackageStats() {
  return useQuery<PackageStats>({
    queryKey: ['package-stats'],
    queryFn: getPackageStats,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook to get packages by language
 */
export function usePackagesByLanguage(
  language: 'PYTHON' | 'NODEJS' | 'RUST',
  limit: number = 10
) {
  return useQuery<PaginatedResponse<Package>>({
    queryKey: ['packages-by-language', language, limit],
    queryFn: () => getPackages({ language, sortBy: 'stars', limit }),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
