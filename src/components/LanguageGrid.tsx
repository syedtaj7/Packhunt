import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const languages = [
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    logo: '/logos/python.svg',
    description: 'Scientific computing, data science, web development',
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    icon: '🟢',
    logo: '/logos/nodejs.svg',
    description: 'Backend APIs, real-time apps, tooling',
  },
  {
    id: 'rust',
    name: 'Rust',
    icon: '🦀',
    logo: '/logos/rust.svg',
    description: 'Systems programming, performance-critical apps',
  },
  {
    id: 'go',
    name: 'Go',
    icon: '🔷',
    logo: '/logos/go.svg',
    description: 'Cloud infrastructure, microservices, DevOps tools',
  },
  {
    id: 'java',
    name: 'Java',
    icon: '☕',
    logo: '/logos/java.svg',
    description: 'Enterprise applications, Android development',
  },
  {
    id: 'csharp',
    name: 'C#',
    icon: '💜',
    logo: '/logos/csharp.svg',
    description: '.NET ecosystem, game development, enterprise',
  },
  {
    id: 'ruby',
    name: 'Ruby',
    icon: '💎',
    logo: '/logos/ruby.svg',
    description: 'Web development with Rails, scripting, automation',
  },
  {
    id: 'php',
    name: 'PHP',
    icon: '🐘',
    logo: '/logos/php.svg',
    description: 'Web development, WordPress, Laravel applications',
  },
  {
    id: 'swift',
    name: 'Swift',
    icon: '🔶',
    logo: '/logos/swift.svg',
    description: 'iOS, macOS, watchOS app development',
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    icon: '🟣',
    logo: '/logos/kotlin.svg',
    description: 'Android apps, multiplatform mobile development',
  },
  {
    id: 'dart',
    name: 'Dart',
    icon: '🎯',
    logo: '/logos/dart.svg',
    description: 'Flutter apps, cross-platform mobile development',
  },
  {
    id: 'elixir',
    name: 'Elixir',
    icon: '💧',
    logo: '/logos/elixir.svg',
    description: 'Scalable real-time applications, Phoenix framework',
  },
  {
    id: 'haskell',
    name: 'Haskell',
    icon: '🎩',
    logo: '/logos/haskell.svg',
    description: 'Functional programming, type safety, correctness',
  },
  {
    id: 'scala',
    name: 'Scala',
    icon: '🔴',
    logo: '/logos/scala.svg',
    description: 'JVM language, functional + OOP, big data processing',
  },
  {
    id: 'cpp',
    name: 'C++',
    icon: '⚡',
    logo: '/logos/c++.svg',
    description: 'High-performance systems, game engines, embedded',
  },
  {
    id: 'r',
    name: 'R',
    icon: '📊',
    logo: '/logos/R-lang.svg',
    description: 'Statistical computing, data analysis, visualization',
  },
  {
    id: 'julia',
    name: 'Julia',
    icon: '🟢',
    logo: '/logos/julia2.svg',
    description: 'Scientific computing, numerical analysis, ML',
  },
];

const languageStyles: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  python: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500', accent: 'bg-blue-500' },
  nodejs: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-500', accent: 'bg-green-500' },
  rust: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-500', accent: 'bg-orange-500' },
  go: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-500', accent: 'bg-cyan-500' },
  java: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500', accent: 'bg-red-500' },
  csharp: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-500', accent: 'bg-purple-500' },
  ruby: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-500', accent: 'bg-pink-500' },
  php: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-500', accent: 'bg-indigo-500' },
  swift: { bg: 'bg-orange-600/10', border: 'border-orange-600/30', text: 'text-orange-600', accent: 'bg-orange-600' },
  kotlin: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-500', accent: 'bg-violet-500' },
  dart: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-500', accent: 'bg-sky-500' },
  elixir: { bg: 'bg-purple-600/10', border: 'border-purple-600/30', text: 'text-purple-600', accent: 'bg-purple-600' },
  haskell: { bg: 'bg-slate-600/10', border: 'border-slate-600/30', text: 'text-slate-600', accent: 'bg-slate-600' },
  scala: { bg: 'bg-red-600/10', border: 'border-red-600/30', text: 'text-red-600', accent: 'bg-red-600' },
  cpp: { bg: 'bg-blue-600/10', border: 'border-blue-600/30', text: 'text-blue-600', accent: 'bg-blue-600' },
  r: { bg: 'bg-blue-700/10', border: 'border-blue-700/30', text: 'text-blue-700', accent: 'bg-blue-700' },
  julia: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500', accent: 'bg-emerald-500' },
};

export function LanguageGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="w-14 h-14 flex items-center justify-center">
                <img 
                  src={lang.logo} 
                  alt={lang.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
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
              styles.accent
            )} />
          </Link>
        );
      })}
    </div>
  );
}