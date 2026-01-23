import { Link } from 'react-router-dom';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/40 backdrop-blur-sm mt-20">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <img 
                src="/logos/PackHunt.svg" 
                alt="PackHunt Logo" 
                className="h-10 w-auto group-hover:scale-105 transition-all duration-300"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              AI-powered package discovery for developers. Find the right library for your next project.
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-success font-medium">All systems operational</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Explore</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/search" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">Search Packages</Link></li>
              <li><Link to="/languages" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">By Language</Link></li>
              <li><Link to="/starred" className="hover:text-primary transition-colors duration-200 hover:translate-x-1 inline-block">Starred</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Languages</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/languages/python" className="hover:text-blue-500 transition-colors duration-200 hover:translate-x-1 inline-block">Python</Link></li>
              <li><Link to="/languages/nodejs" className="hover:text-green-500 transition-colors duration-200 hover:translate-x-1 inline-block">Node.js</Link></li>
              <li><Link to="/languages/rust" className="hover:text-orange-500 transition-colors duration-200 hover:translate-x-1 inline-block">Rust</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Community</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="https://github.com/syedtaj7/Packhunt" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-all duration-200 flex items-center gap-2 group hover:translate-x-1">
                  <Github className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-all duration-200 flex items-center gap-2 group hover:translate-x-1">
                  <Twitter className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 PackHunt. Built with ❤️ for developers.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="hover:text-primary transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}