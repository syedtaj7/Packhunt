import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  initialValue?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
  size?: 'default' | 'large';
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  initialValue = '',
  onSearch,
  placeholder = 'Search packages by name, description, or need...',
  size = 'default',
  autoFocus = false,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative flex items-center">
        <SearchIcon 
          className={cn(
            "absolute left-3 text-muted-foreground pointer-events-none",
            size === 'large' ? 'h-5 w-5' : 'h-4 w-4'
          )} 
        />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            "pr-20",
            size === 'large' 
              ? 'h-14 pl-12 text-lg rounded-xl' 
              : 'h-10 pl-10 rounded-lg'
          )}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-12 h-6 w-6"
            onClick={clearQuery}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          onClick={() => handleSubmit()}
          className={cn(
            "absolute right-1.5",
            size === 'large' ? 'h-10 px-4' : 'h-7 px-3 text-xs'
          )}
        >
          Search
        </Button>
      </div>
    </div>
  );
}