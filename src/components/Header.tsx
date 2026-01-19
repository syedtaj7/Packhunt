import { Link } from 'react-router-dom';
import { Moon, Sun, Search, Star, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              PH
            </div>
            <span className="text-xl font-semibold tracking-tight">PackHunt</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/search" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Explore
            </Link>
            <Link 
              to="/languages" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Languages
            </Link>
            <Link 
              to="/starred" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Starred
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/search" className="hidden sm:flex">
            <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline">Search packages...</span>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-flex">
                ⌘K
              </kbd>
            </Button>
          </Link>
          
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-3">
            <Link 
              to="/search" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore
            </Link>
            <Link 
              to="/languages" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Languages
            </Link>
            <Link 
              to="/starred" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Starred
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}