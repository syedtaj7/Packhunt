import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchBar } from '@/components/SearchBar';
import { PackageCard } from '@/components/PackageCard';
import { LanguageGrid } from '@/components/LanguageGrid';
import { useTrendingPackages, usePackageStats } from '@/hooks/useApi';
import { ArrowRight, Zap, Search, Code, Loader2, TrendingUp, Package, Star, Download, Sparkles } from 'lucide-react';
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
        <section className="relative py-24 md:py-40 overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="container relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Package Discovery</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                Discover the perfect
                <span className="text-primary"> library</span>
                <br />for your project
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Search Python, Node.js, and Rust packages with natural language.
                Get instant install commands, examples, and smart alternatives.
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
        <section className="py-20 border-y border-border/50 bg-card/30">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group relative p-6 rounded-2xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <div className="shrink-0 h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Semantic Search</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Search by what you need, not just package names. Our AI understands your intent.</p>
              </div>
              <div className="group relative p-6 rounded-2xl bg-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                <div className="shrink-0 h-12 w-12 rounded-xl bg-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-purple-500 transition-colors">Ready-to-Use Examples</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Copy-paste code snippets and install commands for instant integration.</p>
              </div>
              <div className="group relative p-6 rounded-2xl bg-info/5 border border-info/20 hover:border-info/40 transition-all duration-300 hover:shadow-lg hover:shadow-info/10">
                <div className="shrink-0 h-12 w-12 rounded-xl bg-info flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-info transition-colors">Smart Alternatives</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Discover similar packages and alternatives when one doesn't fit your needs.</p>
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
        <section className="py-20 bg-card/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Package Statistics</h2>
              <p className="text-muted-foreground text-lg">Explore our growing collection of curated packages</p>
            </div>
            
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : statsData ? (
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="p-6 bg-card border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">Total Packages</h3>
                  </div>
                  <p className="text-4xl font-bold text-primary">{statsData.total.toLocaleString()}</p>
                </Card>
                
                <Card className="p-6 bg-card border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Code className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-sm">Python</h3>
                  </div>
                  <p className="text-4xl font-bold">{statsData.byLanguage.python.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">packages</p>
                </Card>
                
                <Card className="p-6 bg-card border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <Code className="h-5 w-5 text-green-500" />
                    </div>
                    <h3 className="font-semibold text-sm">Node.js</h3>
                  </div>
                  <p className="text-4xl font-bold">{statsData.byLanguage.nodejs.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">packages</p>
                </Card>
                
                <Card className="p-6 bg-card border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:shadow-lg group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                      <Code className="h-5 w-5 text-orange-500" />
                    </div>
                    <h3 className="font-semibold text-sm">Rust</h3>
                  </div>
                  <p className="text-4xl font-bold">{statsData.byLanguage.rust.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">packages</p>
                </Card>
                
                <Card className="p-6 md:col-span-2 bg-card border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:shadow-lg group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                      <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <h3 className="font-semibold text-sm">Total Stars</h3>
                  </div>
                  <p className="text-4xl font-bold">{statsData.totalStars.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">across all packages</p>
                </Card>
                
                <Card className="p-6 md:col-span-2 bg-card border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                      <Download className="h-5 w-5 text-purple-500" />
                    </div>
                    <h3 className="font-semibold text-sm">Total Downloads</h3>
                  </div>
                  <p className="text-4xl font-bold">{statsData.totalDownloads.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">across all packages</p>
                </Card>
              </div>
            ) : null}
          </div>
        </section>

        {/* Trending Packages */}
        <section className="py-20">
          <div className="container">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">Trending Packages</h2>
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