import { Link } from 'react-router-dom';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                PH
              </div>
              <span className="text-lg font-semibold">PackHunt</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered package discovery for developers. Find the right library for your next project.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/search" className="hover:text-foreground transition-colors">Search Packages</Link></li>
              <li><Link to="/languages" className="hover:text-foreground transition-colors">By Language</Link></li>
              <li><Link to="/starred" className="hover:text-foreground transition-colors">Starred</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Languages</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/languages/python" className="hover:text-foreground transition-colors">Python</Link></li>
              <li><Link to="/languages/nodejs" className="hover:text-foreground transition-colors">Node.js</Link></li>
              <li><Link to="/languages/rust" className="hover:text-foreground transition-colors">Rust</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 PackHunt. Built for developers.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="text-success">🟢 All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}