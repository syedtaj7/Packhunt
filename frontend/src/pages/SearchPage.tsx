import { useSearchParams, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchBar } from '@/components/SearchBar';
import { PackageCard } from '@/components/PackageCard';
import { FilterBar } from '@/components/FilterBar';
import { useSearchPackages, useSearchPackagesSemantic, useSearchPackagesHybrid, usePackages } from '@/hooks/useApi';
import { useState, useEffect } from 'react';
import { Loader2, ArrowUpDown, Sparkles, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { lang } = useParams<{ lang?: string }>();
  const query = searchParams.get('q') || '';
  
  // Initialize language from URL param or query param
  const [language, setLanguage] = useState(lang ? lang.toUpperCase() : 'all');
  const [minStars, setMinStars] = useState('all');
  const [license, setLicense] = useState('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'stars' | 'downloads' | 'recent' | 'name'>('relevance');
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic' | 'hybrid'>('hybrid'); // Default to hybrid (best)
  
  // Update language when URL param changes
  useEffect(() => {
    if (lang) {
      setLanguage(lang.toUpperCase());
    }
  }, [lang]);

  // Build search parameters for API
  const searchAPIParams = {
    q: query || undefined,
    language: language !== 'all' ? (language as 'PYTHON' | 'NODEJS' | 'RUST') : undefined,
    minStars: minStars !== 'all' ? parseInt(minStars) : undefined,
    license: license !== 'all' ? license : undefined,
    sortBy: query ? sortBy : undefined, // Only use sortBy when searching
  };

  // Determine which endpoint to use
  const useSearchEndpoint = !!query;
  
  // Only enable the hook for the selected search mode to avoid multiple API calls
  const { data: keywordData, isLoading: keywordLoading, error: keywordError } = useSearchPackages(
    searchAPIParams,
    searchMode === 'keyword' && useSearchEndpoint
  );
  
  const { data: semanticData, isLoading: semanticLoading, error: semanticError } = useSearchPackagesSemantic(
    searchAPIParams,
    searchMode === 'semantic' && useSearchEndpoint
  );
  
  const { data: hybridData, isLoading: hybridLoading, error: hybridError } = useSearchPackagesHybrid(
    searchAPIParams,
    searchMode === 'hybrid' && useSearchEndpoint
  );
  
  // Fetch packages when not searching (browsing mode)
  const packagesParams = {
    language: language !== 'all' ? (language as 'PYTHON' | 'NODEJS' | 'RUST') : undefined,
    sortBy: sortBy === 'recent' ? 'recent' : sortBy as any,
    limit: 50,
  };
  
  const { data: packagesData, isLoading: packagesLoading, error: packagesError } = usePackages(
    packagesParams,
    !useSearchEndpoint // Only fetch packages when not searching
  );
  
  // Select data based on search mode
  let data, isLoading, error;
  if (useSearchEndpoint) {
    if (searchMode === 'semantic') {
      data = semanticData;
      isLoading = semanticLoading;
      error = semanticError;
    } else if (searchMode === 'hybrid') {
      data = hybridData;
      isLoading = hybridLoading;
      error = hybridError;
    } else {
      data = keywordData;
      isLoading = keywordLoading;
      error = keywordError;
    }
  } else {
    data = packagesData;
    isLoading = packagesLoading;
    error = packagesError;
  }
  
  // Handle undefined data (when hook is disabled or loading)
  const results = (data?.data || []) as any[];
  
  // If we don't have data and we're not loading, show loading state
  // This happens when switching search modes
  const actuallyLoading = isLoading || (!data && useSearchEndpoint && !error);
  
  // Get language name for display
  const languageNames: Record<string, string> = {
    PYTHON: 'Python',
    NODEJS: 'Node.js',
    RUST: 'Rust',
  };

  const handleSearch = (newQuery: string) => {
    setSearchParams(newQuery ? { q: newQuery } : {});
  };

  const clearFilters = () => {
    // Don't clear language if we're on a language-specific page
    if (!lang) {
      setLanguage('all');
    }
    setMinStars('all');
    setLicense('all');
    setSortBy('relevance');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-10">
        <div className="mb-10">
          <SearchBar initialValue={query} onSearch={handleSearch} autoFocus />
        
        {/* Example Queries - Only show when no search query */}
          {!query && (
            <div className="mt-6 text-center animate-in">
              <p className="text-sm text-muted-foreground mb-3 font-medium">Try natural language queries:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'fast web framework for APIs',
                  'plotting library for data visualization',
                  'async HTTP client',
                  'ORM for database',
                  'parallel computing library'
                ].map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(example)}
                    className="text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-300 hover:scale-105"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Search Mode Toggle - Only show when there's a query */}
        {query && (
          <div className="mb-8 flex items-center justify-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm w-fit mx-auto">
            <Button
              variant={searchMode === 'keyword' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSearchMode('keyword')}
              className={cn(
                "gap-2 transition-all duration-300 rounded-xl",
                searchMode === 'keyword' ? 'shadow-md' : 'hover:bg-muted'
              )}
            >
              <Search className="h-4 w-4" />
              Keyword
            </Button>
            <Button
              variant={searchMode === 'hybrid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSearchMode('hybrid')}
              className={cn(
                "gap-2 transition-all duration-300 rounded-xl",
                searchMode === 'hybrid' ? 'shadow-md' : 'hover:bg-muted'
              )}
            >
              <Sparkles className="h-4 w-4" />
              Smart Search
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary border-0">BEST</Badge>
            </Button>
            <Button
              variant={searchMode === 'semantic' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSearchMode('semantic')}
              className={cn(
                "gap-2 transition-all duration-300 rounded-xl",
                searchMode === 'semantic' ? 'shadow-md' : 'hover:bg-muted'
              )}
            >
              <Sparkles className="h-4 w-4" />
              AI Only
            </Button>
            <Badge variant="outline" className="ml-2 text-xs bg-primary/10 border-primary/20">
              100% Free • Local AI
            </Badge>
          </div>
        )}
        
        {/* Page Title for Language Filtering */}
        {lang && !query && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              {languageNames[language] || language} Packages
            </h1>
            <p className="text-muted-foreground">
              Explore the best {languageNames[language] || language} libraries
            </p>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <p className="text-muted-foreground">
            {actuallyLoading ? (
              'Searching...'
            ) : (
              <>
                {results.length} package{results.length !== 1 ? 's' : ''} found
                {query && <span> for "<strong className="text-foreground">{query}</strong>"</span>}
              </>
            )}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {query && <SelectItem value="relevance">Relevance</SelectItem>}
                  <SelectItem value="stars">Most Stars</SelectItem>
                  <SelectItem value="downloads">Most Downloads</SelectItem>
                  <SelectItem value="recent">Recently Updated</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <FilterBar
              selectedLanguage={language}
              selectedMinStars={minStars}
              selectedLicense={license}
              onLanguageChange={setLanguage}
              onMinStarsChange={setMinStars}
              onLicenseChange={setLicense}
              onClearFilters={clearFilters}
            />
          </div>
        </div>

        {/* Loading State */}
        {actuallyLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Searching packages...</span>
          </div>
        )}

        {/* Error State */}
        {error && !actuallyLoading && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to search packages. Please make sure the backend server is running.
              <br />
              <code className="text-xs mt-2 block">Error: {error?.message || 'Unknown error'}</code>
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {!actuallyLoading && !error && results.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} />
            ))}
          </div>
        )}
        
        {/* Empty State */}
        {!actuallyLoading && !error && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No packages found matching your criteria.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}