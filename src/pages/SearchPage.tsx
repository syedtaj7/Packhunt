import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchBar } from '@/components/SearchBar';
import { PackageCard } from '@/components/PackageCard';
import { FilterBar } from '@/components/FilterBar';
import { searchPackages } from '@/data/packages';
import { useState, useMemo } from 'react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [language, setLanguage] = useState('all');
  const [minStars, setMinStars] = useState('all');
  const [license, setLicense] = useState('all');

  const results = useMemo(() => {
    return searchPackages(query, {
      language: language !== 'all' ? language : undefined,
      minStars: minStars !== 'all' ? parseInt(minStars) : undefined,
      license: license !== 'all' ? license : undefined,
    });
  }, [query, language, minStars, license]);

  const handleSearch = (newQuery: string) => {
    setSearchParams(newQuery ? { q: newQuery } : {});
  };

  const clearFilters = () => {
    setLanguage('all');
    setMinStars('all');
    setLicense('all');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <SearchBar initialValue={query} onSearch={handleSearch} autoFocus />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <p className="text-muted-foreground">
            {results.length} package{results.length !== 1 ? 's' : ''} found
            {query && <span> for "<strong className="text-foreground">{query}</strong>"</span>}
          </p>
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

        {results.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No packages found matching your criteria.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}