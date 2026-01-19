import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PackageCard } from '@/components/PackageCard';
import { useStarredPackages } from '@/hooks/useLocalStorage';
import { usePackages } from '@/hooks/useApi';
import { Loader2, Star } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function StarredPage() {
  const { starred } = useStarredPackages();
  const { data, isLoading, error } = usePackages({ limit: 100 });
  
  // Filter packages to only show starred ones
  const starredPackages = data?.data?.filter(pkg => starred.includes(pkg.slug)) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Star className="h-8 w-8 text-warning fill-warning" />
            <h1 className="text-3xl font-bold">Starred Packages</h1>
          </div>
          <p className="text-muted-foreground">
            Your favorite packages in one place
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading packages...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load packages. Please make sure the backend server is running.
              <br />
              <code className="text-xs mt-2 block">Error: {error.message}</code>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && !error && starredPackages.length === 0 && (
          <div className="text-center py-16">
            <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No starred packages yet</h2>
            <p className="text-muted-foreground mb-6">
              Start exploring and star your favorite packages!
            </p>
          </div>
        )}

        {/* Starred Packages Grid */}
        {!isLoading && !error && starredPackages.length > 0 && (
          <>
            <p className="text-muted-foreground mb-6">
              {starredPackages.length} package{starredPackages.length !== 1 ? 's' : ''} starred
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {starredPackages.map((pkg) => (
                <PackageCard key={pkg.id} package={pkg} />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
