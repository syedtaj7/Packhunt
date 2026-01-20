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
    }
  };
  
  // Get license display (API returns string, old data returns string)
  const licenseDisplay = pkg.license || 'MIT';

  return (
    <Card className="group hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
      <Link to={`/package/${packageId}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                  {pkg.name}
                </h3>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs border shrink-0", languageColors[pkg.language])}
                >
                  {languageNames[pkg.language]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {pkg.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "shrink-0 h-8 w-8",
                starred && "text-warning"
              )}
              onClick={handleStarClick}
            >
              <Star className={cn("h-4 w-4", starred && "fill-current")} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 font-mono text-sm">
            <code className="flex-1 truncate text-muted-foreground">
              {pkg.installCommand}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={copyInstallCommand}
            >
              {copied ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {formatNumber(pkg.stars)}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-4 w-4" />
              {formatNumber(pkg.forks)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
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