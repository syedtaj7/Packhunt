import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchBar } from '@/components/SearchBar';
import { PackageCard } from '@/components/PackageCard';
import { LanguageGrid } from '@/components/LanguageGrid';
import { useTrendingPackages, usePackageStats } from '@/hooks/useApi';
import { ArrowRight, Zap, Search, Code, Loader2, TrendingUp, Package, Star, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';

const Index = () => {
  // Fetch trending packages and stats from API
  const { data: trendingData, isLoading: trendingLoading, error: trendingError } = useTrendingPackages(6);
  const { data: statsData, isLoading: statsLoading } = usePackageStats();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5" />
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Discover the perfect
                <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent"> library</span> for your project
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Search Python, Node.js, and Rust packages by what you need. Get install commands, examples, and alternatives instantly.
              </p>
              <SearchBar size="large" placeholder="Try 'real-time plotting', 'RF simulation', or 'async HTTP'..." />
              
              <div className="flex flex-wrap justify-center gap-2 mt-6 text-sm text-muted-foreground">
                <span>Popular:</span>
                <Link to="/search?q=web+framework" className="text-primary hover:underline">Web frameworks</Link>
                <span>•</span>
                <Link to="/search?q=signal+processing" className="text-primary hover:underline">Signal processing</Link>
                <span>•</span>
                <Link to="/search?q=database" className="text-primary hover:underline">Database ORMs</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 border-y border-border bg-card/50">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex gap-4">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Semantic Search</h3>
                  <p className="text-sm text-muted-foreground">Search by what you need, not just package names</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Code className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Ready-to-Use Examples</h3>
                  <p className="text-sm text-muted-foreground">Copy-paste code snippets for instant integration</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Smart Alternatives</h3>
                  <p className="text-sm text-muted-foreground">Find similar packages when one doesn't fit</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Languages */}
        <section className="py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Browse by Language</h2>
              <Link to="/languages">
                <Button variant="ghost" className="gap-2">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <LanguageGrid />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-card/50 border-y border-border">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8">Package Statistics</h2>
            
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : statsData ? (
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Total Packages</h3>
                  </div>
                  <p className="text-3xl font-bold">{statsData.total.toLocaleString()}</p>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Code className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Python</h3>
                  </div>
                  <p className="text-3xl font-bold">{statsData.byLanguage.python.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">packages</p>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Code className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Node.js</h3>
                  </div>
                  <p className="text-3xl font-bold">{statsData.byLanguage.nodejs.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">packages</p>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Code className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold">Rust</h3>
                  </div>
                  <p className="text-3xl font-bold">{statsData.byLanguage.rust.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">packages</p>
                </Card>
                
                <Card className="p-6 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold">Total Stars</h3>
                  </div>
                  <p className="text-3xl font-bold">{statsData.totalStars.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">across all packages</p>
                </Card>
                
                <Card className="p-6 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <Download className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">Total Downloads</h3>
                  </div>
                  <p className="text-3xl font-bold">{statsData.totalDownloads.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">across all packages</p>
                </Card>
              </div>
            ) : null}
          </div>
        </section>

        {/* Trending Packages */}
        <section className="py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Trending Packages</h2>
              </div>
              <Link to="/search">
                <Button variant="ghost" className="gap-2">
                  Explore all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Loading State */}
            {trendingLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading packages...</span>
              </div>
            )}
            
            {/* Error State */}
            {trendingError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load packages. Please make sure the backend server is running on port 3001.
                  <br />
                  <code className="text-xs mt-2 block">Error: {trendingError.message}</code>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Success State */}
            {trendingData?.data && trendingData.data.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingData.data.map((pkg) => (
                  <PackageCard key={pkg.id} package={pkg} />
                ))}
              </div>
            )}
            
            {/* Empty State */}
            {trendingData?.data && trendingData.data.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No trending packages found. Try running the seed script!
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;