import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CodeBlock } from '@/components/CodeBlock';
import { PackageCard } from '@/components/PackageCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePackage } from '@/hooks/useApi';
import { useStarredPackages } from '@/hooks/useLocalStorage';
import { Star, GitFork, ExternalLink, ArrowLeft, Copy, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

const languageColors: Record<string, string> = {
  python: 'bg-python/20 text-python border-python/30',
  nodejs: 'bg-nodejs/20 text-nodejs border-nodejs/30',
  rust: 'bg-rust/20 text-rust border-rust/30',
  PYTHON: 'bg-python/20 text-python border-python/30',
  NODEJS: 'bg-nodejs/20 text-nodejs border-nodejs/30',
  RUST: 'bg-rust/20 text-rust border-rust/30',
};

const languageNames: Record<string, string> = {
  PYTHON: 'Python',
  NODEJS: 'Node.js',
  RUST: 'Rust',
};

export default function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: pkg, isLoading, error } = usePackage(id);
  const { isStarred, toggleStar } = useStarredPackages();
  const [copied, setCopied] = useState(false);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading package details...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load package details. Please make sure the backend server is running.
              <br />
              <code className="text-xs mt-2 block">Error: {error.message}</code>
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Link to="/search"><Button>Back to search</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not Found State
  if (!pkg) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Package not found</h1>
          <Link to="/search"><Button>Back to search</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  const starred = isStarred(pkg.slug);
  const copyInstall = async () => {
    await navigator.clipboard.writeText(pkg.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Get language display name
  const languageDisplay = languageNames[pkg.language] || pkg.language;
  
  // Related packages (alternatives)
  const related = pkg.alternatives || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <Link to="/search" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{pkg.name}</h1>
                  <Badge variant="outline" className={cn("border", languageColors[pkg.language])}>
                    {languageDisplay}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground">{pkg.description}</p>
              </div>
              <Button variant={starred ? "default" : "outline"} onClick={() => toggleStar(pkg.slug)} className="gap-2">
                <Star className={cn("h-4 w-4", starred && "fill-current")} />
                {starred ? 'Starred' : 'Star'}
              </Button>
            </div>

            <div className="flex items-center gap-6 mb-8 text-sm">
              <span className="flex items-center gap-1"><Star className="h-4 w-4" /> {pkg.stars.toLocaleString()}</span>
              <span className="flex items-center gap-1"><GitFork className="h-4 w-4" /> {pkg.forks.toLocaleString()}</span>
              <Badge variant="secondary">{pkg.license || 'MIT'}</Badge>
              <a href={pkg.githubUrl} target="_blank" rel="noopener" className="flex items-center gap-1 text-primary hover:underline">
                GitHub <ExternalLink className="h-3 w-3" />
              </a>
              {pkg.docsUrl && (
                <a href={pkg.docsUrl} target="_blank" rel="noopener" className="flex items-center gap-1 text-primary hover:underline">
                  Docs <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 font-mono text-sm mb-8">
              <code className="flex-1">{pkg.installCommand}</code>
              <Button variant="ghost" size="sm" onClick={copyInstall}>
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <Tabs defaultValue="examples">
              <TabsList>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
              </TabsList>
              <TabsContent value="examples" className="mt-6 space-y-6">
                {pkg.examples && pkg.examples.length > 0 ? (
                  pkg.examples.map((example, i) => (
                    <div key={i}>
                      <h3 className="font-semibold mb-2">{example.title}</h3>
                      {example.description && (
                        <p className="text-sm text-muted-foreground mb-3">{example.description}</p>
                      )}
                      <CodeBlock code={example.code} language={example.language.toLowerCase()} />
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No examples available yet.</p>
                )}
              </TabsContent>
              <TabsContent value="alternatives" className="mt-6">
                {related.length > 0 ? (
                  <div className="space-y-4">
                    {related.map((alt) => (
                      <PackageCard key={alt.id} package={alt} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No alternatives available yet.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {related.length > 0 && (
            <aside className="lg:w-80 shrink-0">
              <h3 className="font-semibold mb-4">Alternative Packages</h3>
              <div className="space-y-4">
                {related.slice(0, 3).map((r) => <PackageCard key={r.id} package={r} />)}
              </div>
            </aside>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}