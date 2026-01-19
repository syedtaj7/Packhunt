import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { languages } from '@/data/packages';

interface FilterBarProps {
  selectedLanguage: string;
  selectedMinStars: string;
  selectedLicense: string;
  onLanguageChange: (value: string) => void;
  onMinStarsChange: (value: string) => void;
  onLicenseChange: (value: string) => void;
  onClearFilters: () => void;
}

const starOptions = [
  { value: 'all', label: 'Any stars' },
  { value: '1000', label: '1k+ stars' },
  { value: '5000', label: '5k+ stars' },
  { value: '10000', label: '10k+ stars' },
  { value: '50000', label: '50k+ stars' },
];

const licenseOptions = [
  { value: 'all', label: 'Any license' },
  { value: 'mit', label: 'MIT' },
  { value: 'apache', label: 'Apache' },
  { value: 'bsd', label: 'BSD' },
  { value: 'gpl', label: 'GPL' },
];

export function FilterBar({
  selectedLanguage,
  selectedMinStars,
  selectedLicense,
  onLanguageChange,
  onMinStarsChange,
  onLicenseChange,
  onClearFilters,
}: FilterBarProps) {
  const hasFilters = selectedLanguage !== 'all' || selectedMinStars !== 'all' || selectedLicense !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={selectedLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Languages</SelectItem>
          {languages.map((lang) => (
            <SelectItem key={lang.id} value={lang.id}>
              <span className="flex items-center gap-2">
                <span>{lang.icon}</span>
                {lang.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedMinStars} onValueChange={onMinStarsChange}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Stars" />
        </SelectTrigger>
        <SelectContent>
          {starOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedLicense} onValueChange={onLicenseChange}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="License" />
        </SelectTrigger>
        <SelectContent>
          {licenseOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1">
          <X className="h-3 w-3" />
          Clear filters
        </Button>
      )}
    </div>
  );
}