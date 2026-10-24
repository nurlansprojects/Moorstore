import React from 'react';
import { Category } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  Smartphone,
  BookOpen,
  Shirt,
  Car,
  Home,
  Sparkles,
  Grid,
  Layers,
  LucideIcon
} from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Smartphone,
  BookOpen,
  Shirt,
  Car,
  Home,
  Sparkles,
  Grid,
  Layers,
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { lang, t } = useLanguage();

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {/* All Categories Option */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedCategoryId === null
              ? 'bg-[#EFBF04] text-zinc-950 shadow-md font-bold'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>{t('all_categories')}</span>
        </button>

        {/* Dynamic Categories */}
        {categories
          .filter((c) => c.isActive !== false)
          .map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Grid;
            const isSelected = selectedCategoryId === cat.id;
            const localizedName = cat.name?.[lang] || cat.name?.ru || cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EFBF04] text-zinc-950 shadow-md font-bold'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{localizedName}</span>
              </button>
            );
          })}
      </div>
    </div>
  );
};
