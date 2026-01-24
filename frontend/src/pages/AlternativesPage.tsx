import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePackage, useSearchPackages, useSearchPackagesSemantic } from '@/hooks/useApi';
import { Package } from '@/lib/api';
import { Search, ArrowRight, Loader2, Sparkles, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/LoginModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languageColors: Record<string, string> = {
  PYTHON: 'bg-python/20 text-python border-python/30',
  NODEJS: 'bg-nodejs/20 text-nodejs border-nodejs/30',
  RUST: 'bg-rust/20 text-rust border-rust/30',
  GO: 'bg-go/20 text-go border-go/30',
  JAVA: 'bg-java/20 text-java border-java/30',
  CSHARP: 'bg-csharp/20 text-csharp border-csharp/30',
  RUBY: 'bg-ruby/20 text-ruby border-ruby/30',
  PHP: 'bg-php/20 text-php border-php/30',
  SWIFT: 'bg-swift/20 text-swift border-swift/30',
  KOTLIN: 'bg-kotlin/20 text-kotlin border-kotlin/30',
  DART: 'bg-dart/20 text-dart border-dart/30',
  ELIXIR: 'bg-elixir/20 text-elixir border-elixir/30',
  HASKELL: 'bg-haskell/20 text-haskell border-haskell/30',
  SCALA: 'bg-scala/20 text-scala border-scala/30',
  CPP: 'bg-cpp/20 text-cpp border-cpp/30',
  R: 'bg-r/20 text-r border-r/30',
  JULIA: 'bg-julia/20 text-julia border-julia/30',
};

const languageLogos: Record<string, string> = {
  PYTHON: '/logos/python.svg',
  NODEJS: '/logos/nodejs.svg',
  RUST: '/logos/rust.svg',
  GO: '/logos/go.svg',
  JAVA: '/logos/java.svg',
  CSHARP: '/logos/csharp.svg',
  RUBY: '/logos/ruby.svg',
  PHP: '/logos/php.svg',
  SWIFT: '/logos/swift.svg',
  KOTLIN: '/logos/kotlin.svg',
  DART: '/logos/dart.svg',
  ELIXIR: '/logos/elixir.svg',
  HASKELL: '/logos/haskell.svg',
  SCALA: '/logos/scala.svg',
  CPP: '/logos/c++.svg',
  R: '/logos/R-lang.svg',
  JULIA: '/logos/julia2.svg',
};

const languageNames: Record<string, string> = {
  PYTHON: 'Python',
  NODEJS: 'Node.js',
  RUST: 'Rust',
  GO: 'Go',
  JAVA: 'Java',
  CSHARP: 'C#',
  RUBY: 'Ruby',
  PHP: 'PHP',
  SWIFT: 'Swift',
  KOTLIN: 'Kotlin',
  DART: 'Dart',
  ELIXIR: 'Elixir',
  HASKELL: 'Haskell',
  SCALA: 'Scala',
  CPP: 'C++',
  R: 'R',
  JULIA: 'Julia',
};

const languages = [
  { value: 'PYTHON', label: 'Python' },
  { value: 'NODEJS', label: 'Node.js' },
  { value: 'RUST', label: 'Rust' },
  { value: 'GO', label: 'Go' },
  { value: 'JAVA', label: 'Java' },
  { value: 'CSHARP', label: 'C#' },
  { value: 'RUBY', label: 'Ruby' },
  { value: 'PHP', label: 'PHP' },
  { value: 'SWIFT', label: 'Swift' },
  { value: 'KOTLIN', label: 'Kotlin' },
  { value: 'DART', label: 'Dart' },
  { value: 'ELIXIR', label: 'Elixir' },
  { value: 'HASKELL', label: 'Haskell' },
  { value: 'SCALA', label: 'Scala' },
  { value: 'CPP', label: 'C++' },
  { value: 'R', label: 'R' },
  { value: 'JULIA', label: 'Julia' },
];

export default function AlternativesPage() {
  const { user, loading: authLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [packageName, setPackageName] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<string>('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [sourcePackage, setSourcePackage] = useState<Package | null>(null);

  // Show login modal if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setShowLoginModal(true);
    }
  }, [user, authLoading]);

  // If not logged in, show login prompt
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">Premium Feature</h1>
              <p className="text-xl text-muted-foreground">
                The Alternatives Finder is a special feature for registered users
              </p>
            </div>
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  What you get with Alternatives Finder:
                </CardTitle>
              </CardHeader>
              <CardContent className="text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Cross-language discovery:</span> Find equivalent packages in any of 17 programming languages
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">AI-powered semantic search:</span> Get intelligent recommendations based on functionality, not just keywords
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Save time:</span> Instantly discover the best alternatives without manual research
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Stay updated:</span> Access our database of 766+ packages across 17 languages
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="pt-4">
              <Button size="lg" onClick={() => setShowLoginModal(true)} className="gap-2">
                <Lock className="h-4 w-4" />
                Sign In to Access
              </Button>
            </div>
          </div>
        </div>
        <Footer />
        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      </div>
    );
  }

  // Try to fetch the source package by name
  const { data: fetchedPackage, isLoading: packageLoading } = usePackage(
    packageName.toLowerCase()
  );

  // Search for alternatives using semantic search with the source package description
  const searchQuery = sourcePackage 
    ? `${sourcePackage.description} ${sourcePackage.categories?.map(c => c.name).join(' ')}`
    : '';
  
  const { data: semanticResults, isLoading: semanticLoading } = useSearchPackagesSemantic(
    { q: searchQuery, language: targetLanguage as any, limit: 20 },
    searchTriggered && !!sourcePackage && !!targetLanguage
  );

  // Also search by category if the source package has categories
  const categorySearch = sourcePackage?.categories?.[0]?.name || '';
  const { data: categoryResults, isLoading: categoryLoading } = useSearchPackages(
    { q: categorySearch, language: targetLanguage as any, limit: 20 },
    searchTriggered && !!categorySearch && !!targetLanguage
  );

  useEffect(() => {
    if (fetchedPackage && searchTriggered) {
      setSourcePackage(fetchedPackage);
    }
  }, [fetchedPackage, searchTriggered]);

  const handleSearch = () => {
    if (packageName && targetLanguage) {
      setSearchTriggered(true);
      setSourcePackage(null);
    }
  };

  const handleReset = () => {
    setPackageName('');
    setTargetLanguage('');
    setSearchTriggered(false);
    setSourcePackage(null);
  };

  // Combine and deduplicate results
  const allResults = [...(semanticResults?.data || []), ...(categoryResults?.data || [])];
  const uniqueResults = Array.from(
    new Map(allResults.map(pkg => [pkg.slug, pkg])).values()
  ).slice(0, 10);

  const isLoading = packageLoading || semanticLoading || categoryLoading;
  const hasResults = uniqueResults.length > 0;
  const showNoResults = searchTriggered && !isLoading && !hasResults && sourcePackage;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Find Cross-Language Alternatives</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Find equivalent packages when switching programming languages. 
            Enter a package name and select your target language to discover the best alternatives.
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Find Alternative Packages
            </CardTitle>
            <CardDescription>
              Tell us what package you're looking for and in which language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="package-name">Package Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="package-name"
                    placeholder="e.g., flask, express, django..."
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the name of the package you want an alternative for
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-language">Target Language</Label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger id="target-language">
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        <div className="flex items-center gap-2">
                          {languageLogos[lang.value] && (
                            <img
                              src={languageLogos[lang.value]}
                              alt={lang.label}
                              className="w-4 h-4 object-contain"
                            />
                          )}
                          {lang.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the language you need the alternative in
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSearch} 
                disabled={!packageName || !targetLanguage || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Find Alternatives
                  </>
                )}
              </Button>
              {searchTriggered && (
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Source Package Info */}
        {sourcePackage && (
          <Card className="mb-6 border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg">Looking for alternatives to:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {languageLogos[sourcePackage.language] && (
                      <img
                        src={languageLogos[sourcePackage.language]}
                        alt={languageNames[sourcePackage.language]}
                        className="w-6 h-6 object-contain"
                      />
                    )}
                    <h3 className="text-xl font-bold">{sourcePackage.name}</h3>
                    <Badge variant="outline" className={cn("text-xs", languageColors[sourcePackage.language])}>
                      {languageNames[sourcePackage.language]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{sourcePackage.description}</p>
                  {sourcePackage.categories && sourcePackage.categories.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {sourcePackage.categories.map((cat) => (
                        <Badge key={cat.id} variant="secondary" className="text-xs">
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>⭐ {sourcePackage.stars.toLocaleString()} stars</div>
                  <div>📥 {((sourcePackage.downloads || 0) / 1000).toFixed(0)}k downloads</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {searchTriggered && hasResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {languageNames[targetLanguage as keyof typeof languageNames]} Alternatives
              </h2>
              <Badge variant="secondary" className="text-sm">
                {uniqueResults.length} {uniqueResults.length === 1 ? 'package' : 'packages'} found
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uniqueResults.map((pkg) => (
                <Link
                  key={pkg.slug}
                  to={`/package/${pkg.slug}`}
                  className="group"
                >
                  <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {languageLogos[pkg.language] && (
                            <img
                              src={languageLogos[pkg.language]}
                              alt={languageNames[pkg.language]}
                              className="w-5 h-5 object-contain flex-shrink-0"
                            />
                          )}
                          <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                            {pkg.name}
                          </CardTitle>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                      <CardDescription className="line-clamp-2">
                        {pkg.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-4 text-muted-foreground">
                          <span>⭐ {pkg.stars.toLocaleString()}</span>
                          <span>📥 {((pkg.downloads || 0) / 1000).toFixed(0)}k</span>
                        </div>
                        <Badge variant="outline" className={cn("text-xs", languageColors[pkg.language])}>
                          {pkg.ecosystem}
                        </Badge>
                      </div>
                      {pkg.categories && pkg.categories.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-3">
                          {pkg.categories.slice(0, 2).map((cat) => (
                            <Badge key={cat.id} variant="secondary" className="text-xs">
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {showNoResults && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No alternatives found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any {languageNames[targetLanguage as keyof typeof languageNames]} packages 
                similar to <strong>{sourcePackage.name}</strong>.
              </p>
              <Button onClick={handleReset} variant="outline">
                Try Another Search
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Package Not Found */}
        {searchTriggered && !sourcePackage && !packageLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">Package not found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find a package named <strong>{packageName}</strong> in our database.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Try searching by category or description instead, or check the spelling.
              </p>
              <Button onClick={handleReset} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        {!searchTriggered && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎯 Step 1</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enter the name of the package you currently use or want an alternative for
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🌐 Step 2</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Select the programming language you need the alternative in
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">✨ Step 3</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get intelligent recommendations based on features, categories, and popularity
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Examples */}
        {!searchTriggered && (
          <div className="mt-8 p-6 rounded-lg bg-accent/50 border">
            <h3 className="font-semibold mb-3">💡 Example searches:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Looking for a <strong>Python</strong> alternative to <strong>Express.js</strong>? → Try Flask or FastAPI</li>
              <li>• Need a <strong>Rust</strong> equivalent of <strong>Lodash</strong>? → Find itertools alternatives</li>
              <li>• Want a <strong>Go</strong> version of <strong>Django</strong>? → Discover Gin or Echo</li>
            </ul>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
