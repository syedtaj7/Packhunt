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
    } else {
      // Navigate to search page without query to show all packages
      navigate('/search');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    // If user cleared the input (backspace to empty), show all packages
    if (newValue === '' && initialValue !== '') {
      if (onSearch) {
        onSearch('');
      } else {
        navigate('/search');
      }
    }
  };

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <div className="relative flex items-center group flex-1">
        <SearchIcon 
          className={cn(
            "absolute left-4 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-primary z-10",
            size === 'large' ? 'h-5 w-5' : 'h-4 w-4'
          )} 
        />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            "w-full pr-20 transition-all duration-200",
            size === 'large' ? [
              'h-14 pl-12 text-base rounded-2xl',
              'border-2 border-border',
              'focus:border-primary focus:ring-4 focus:ring-primary/10',
              'shadow-lg shadow-black/5',
              'hover:shadow-xl hover:shadow-black/10'
            ] : [
              'h-11 pl-11 rounded-xl',
              'border border-border',
              'focus:border-primary focus:ring-2 focus:ring-primary/10'
            ]
          )}
        />
        <Button
          onClick={() => handleSubmit()}
          className={cn(
            "absolute right-1.5 shadow-sm hover:shadow-md transition-all",
            size === 'large' ? 'h-11 px-5 rounded-xl' : 'h-8 px-3 text-xs rounded-lg'
          )}
        >
          Search
        </Button>
      </div>
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={clearQuery}
          className={cn(
            "shrink-0 bg-red-900/90 hover:bg-red-900 text-black transition-all rounded-lg",
            size === 'large' ? 'h-14 w-14' : 'h-11 w-11'
          )}
        >
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}