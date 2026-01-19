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
        
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">🐍 Python</h3>
            <p className="text-sm text-muted-foreground">
              Perfect for data science, machine learning, web development, and automation
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">🟢 Node.js</h3>
            <p className="text-sm text-muted-foreground">
              Build scalable backend services, real-time applications, and modern web apps
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">🦀 Rust</h3>
            <p className="text-sm text-muted-foreground">
              Systems programming with memory safety and blazing fast performance
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
