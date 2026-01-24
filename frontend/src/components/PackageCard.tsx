import { Link } from 'react-router-dom';
import { Star, GitFork, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Package } from '@/lib/api';
import { useStarredPackages } from '@/hooks/useLocalStorage';
import { LoginModal } from '@/components/LoginModal';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LANGUAGE_COLORS } from '@/lib/constants';

interface PackageCardProps {
  package: Package;
}

const languageNames: Record<string, string> = {
  python: 'Python',
  nodejs: 'Node.js',
  rust: 'Rust',
  go: 'Go',
  java: 'Java',
  csharp: 'C#',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  dart: 'Dart',
  elixir: 'Elixir',
  haskell: 'Haskell',
  scala: 'Scala',
  cpp: 'C++',
  r: 'R',
  julia: 'Julia',
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

const languageLogos: Record<string, string> = {
  python: '/logos/python.svg',
  nodejs: '/logos/nodejs.svg',
  rust: '/logos/rust.svg',
  go: '/logos/go.svg',
  java: '/logos/java.svg',
  csharp: '/logos/csharp.svg',
  ruby: '/logos/ruby.svg',
  php: '/logos/php.svg',
  swift: '/logos/swift.svg',
  kotlin: '/logos/kotlin.svg',
  dart: '/logos/dart.svg',
  elixir: '/logos/elixir.svg',
  haskell: '/logos/haskell.svg',
  scala: '/logos/scala.svg',
  cpp: '/logos/c++.svg',
  r: '/logos/R-lang.svg',
  julia: '/logos/julia2.svg',
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

function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) {
    return '0';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

export function PackageCard({ package: pkg }: PackageCardProps) {
  const { isStarred, toggleStar, requiresAuth } = useStarredPackages();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  
  // Handle both old and new package types
  const packageId = 'slug' in pkg ? pkg.slug : pkg.id;
  const starred = isStarred(packageId);

  const copyInstallCommand = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(pkg.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (requiresAuth) {
      setLoginModalOpen(true);
      return;
    }
    
    const success = toggleStar(packageId);
    if (!success) {
      setLoginModalOpen(true);
    } else {
      // Show toast notification
      if (!starred) {
        toast({
          title: "Package starred!",
          description: `${pkg.name} has been added to your starred packages.`,
        });
      } else {
        toast({
          title: "Package unstarred",
          description: `${pkg.name} has been removed from your starred packages.`,
          variant: "default",
        });
      }
    }
  };
  
  // Get license display (API returns string, old data returns string)
  const licenseDisplay = pkg.license || 'MIT';

  return (
    <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 bg-card backdrop-blur-sm">
      <Link to={`/package/${packageId}`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors duration-300">
                  {pkg.name}
                </h3>
                <Badge 
                  variant="outline" 
                  className={cn("inline-flex items-center gap-1.5 text-xs border shrink-0 transition-all duration-300 group-hover:scale-105", LANGUAGE_COLORS[pkg.language])}
                >
                  {languageLogos[pkg.language] && (
                    <img 
                      src={languageLogos[pkg.language]} 
                      alt={languageNames[pkg.language]} 
                      className="w-3.5 h-3.5 object-contain"
                    />
                  )}
                  {languageNames[pkg.language]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {pkg.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "shrink-0 h-9 w-9 rounded-lg transition-all duration-300",
                starred ? "text-warning hover:bg-warning/10" : "hover:bg-muted"
              )}
              onClick={handleStarClick}
            >
              <Star className={cn("h-4 w-4 transition-all duration-300", starred && "fill-current scale-110")} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors border border-border/50 font-mono text-sm group/code">
            <code className="flex-1 truncate text-muted-foreground group-hover/code:text-foreground transition-colors">
              {pkg.installCommand}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 hover:bg-background transition-all"
              onClick={copyInstallCommand}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5 opacity-0 group-hover/code:opacity-100 transition-opacity" />
              )}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between text-sm text-muted-foreground pt-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 hover:text-warning transition-colors">
              <Star className="h-4 w-4" />
              <span className="font-medium">{formatNumber(pkg.stars)}</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-info transition-colors">
              <GitFork className="h-4 w-4" />
              <span className="font-medium">{formatNumber(pkg.forks)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {licenseDisplay}
            </Badge>
          </div>
        </CardFooter>
      </Link>
      
      <LoginModal 
        open={loginModalOpen} 
        onOpenChange={setLoginModalOpen}
        onSuccess={() => {
          toggleStar(packageId);
          toast({
            title: "Package starred!",
            description: `${pkg.name} has been added to your starred packages.`,
          });
        }}
      />
    </Card>
  );
}