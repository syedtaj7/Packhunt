import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LanguageGrid } from '@/components/LanguageGrid';

export default function LanguagesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse by Language</h1>
          <p className="text-muted-foreground">
            Explore packages organized by programming language
          </p>
        </div>
        
        <LanguageGrid />
      </main>
      <Footer />
    </div>
  );
}
