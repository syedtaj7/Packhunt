import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const languages = [
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    description: 'Scientific computing, data science, web development',
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    icon: '🟢',
    description: 'Backend APIs, real-time apps, tooling',
  },
  {
    id: 'rust',
    name: 'Rust',
    icon: '🦀',
    description: 'Systems programming, performance-critical apps',
  },
];

const languageStyles: Record<string, { bg: string; border: string; text: string }> = {
  python: { bg: 'bg-python/10', border: 'border-python/30', text: 'text-python' },
  nodejs: { bg: 'bg-nodejs/10', border: 'border-nodejs/30', text: 'text-nodejs' },
  rust: { bg: 'bg-rust/10', border: 'border-rust/30', text: 'text-rust' },
};

export function LanguageGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {languages.map((lang) => {
        const styles = languageStyles[lang.id];
        return (
          <Link
            key={lang.id}
            to={`/languages/${lang.id}`}
            className={cn(
              "group relative p-6 rounded-xl border-2 transition-all duration-200",
              "hover:shadow-lg hover:-translate-y-1",
              styles.bg,
              styles.border
            )}
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl">{lang.icon}</span>
              <div>
                <h3 className={cn("text-xl font-semibold", styles.text)}>
                  {lang.name}
                </h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {lang.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}