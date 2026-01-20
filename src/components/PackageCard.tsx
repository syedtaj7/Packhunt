import { Link } from 'react-router-dom';
import { Star, GitFork, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Package as OldPackage } from '@/data/packages';
import { Package as APIPackage } from '@/lib/api';
import { useStarredPackages } from '@/hooks/useLocalStorage';
import { LoginModal } from '@/components/LoginModal';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PackageCardProps {
  package: OldPackage | APIPackage;
}

const languageColors: Record<string, string> = {
  python: 'bg-python/20 text-python border-python/30',
  nodejs: 'bg-nodejs/20 text-nodejs border-nodejs/30',
  rust: 'bg-rust/20 text-rust border-rust/30',
  PYTHON: 'bg-python/20 text-python border-python/30',
  NODEJS: 'bg-nodejs/20 text-nodejs border-nodejs/30',
  RUST: 'bg-rust/20 text-rust border-rust/30',
};

const languageNames: Record<string, string> = {
  python: 'Python',
  nodejs: 'Node.js',
  rust: 'Rust',
  PYTHON: 'Python',
  NODEJS: 'Node.js',
  RUST: 'Rust',
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
                  className={cn("text-xs border shrink-0 transition-all duration-300 group-hover:scale-105", languageColors[pkg.language])}
                >
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