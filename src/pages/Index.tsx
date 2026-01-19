import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchBar } from '@/components/SearchBar';
import { PackageCard } from '@/components/PackageCard';
import { LanguageGrid } from '@/components/LanguageGrid';
import { packages } from '@/data/packages';
import { ArrowRight, Zap, Search, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const featuredPackages = packages.slice(0, 6);

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

        {/* Featured Packages */}
        <section className="py-16 bg-card/50 border-y border-border">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Featured Packages</h2>
              <Link to="/search">
                <Button variant="ghost" className="gap-2">
                  Explore all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPackages.map((pkg) => (
                <PackageCard key={pkg.id} package={pkg} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;