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
              "group relative p-8 rounded-2xl border-2 transition-all duration-300",
              "hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]",
              "bg-card",
              styles.bg,
              styles.border
            )}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{lang.icon}</span>
              <div>
                <h3 className={cn("text-2xl font-bold transition-colors duration-300", styles.text, "group-hover:brightness-110")}>
                  {lang.name}
                </h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lang.description}
            </p>
            <div className={cn(
              "absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-300 rounded-b-2xl",
              lang.id === 'python' && "bg-blue-500",
              lang.id === 'nodejs' && "bg-green-500",
              lang.id === 'rust' && "bg-orange-500"
            )} />
          </Link>
        );
      })}
    </div>
  );
}