import React from 'react';
import { Currency } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { SlidersHorizontal, ArrowUpDown, RotateCcw } from 'lucide-react';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'title';

interface FilterBarProps {
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  currency: Currency | 'ALL';
  setCurrency: (cur: Currency | 'ALL') => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  sortBy,
  setSortBy,
  currency,
  setCurrency,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onReset,
  hasActiveFilters,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Price & Currency Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#EFBF04]" />
            <span>{t('price')}:</span>
          </div>

          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder={t('min_price')}
            className="w-20 bg-zinc-950 border border-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#EFBF04]"
          />
          <span className="text-zinc-600">—</span>
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={t('max_price')}
            className="w-20 bg-zinc-950 border border-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#EFBF04]"
          />

          {/* Currency picker */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency | 'ALL')}
            className="bg-zinc-950 border border-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#EFBF04] cursor-pointer"
          >
            <option value="ALL">Любая валюта</option>
            <option value="USD">USD ($)</option>
            <option value="UZS">UZS</option>
            <option value="RUB">RUB (₽)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        {/* Sorting & Reset */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ArrowUpDown className="h-3.5 w-3.5 text-[#EFBF04]" />
            <span>{t('sort_by')}:</span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#EFBF04] cursor-pointer"
          >
            <option value="newest">{t('sort_newest')}</option>
            <option value="price_asc">{t('sort_price_asc')}</option>
            <option value="price_desc">{t('sort_price_desc')}</option>
            <option value="title">{t('sort_title')}</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-zinc-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              title={t('reset_filters')}
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#EFBF04]" />
              <span className="hidden sm:inline">{t('reset_filters')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
