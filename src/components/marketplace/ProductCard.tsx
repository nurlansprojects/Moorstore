import React from 'react';
import { Product, Currency } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Tag, UserCheck, ImageOff } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const formatPrice = (price: number, currency: Currency): string => {
  if (price === 0) return '0';
  const formatted = new Intl.NumberFormat('ru-RU').format(price);
  switch (currency) {
    case 'USD':
      return `$${formatted}`;
    case 'EUR':
      return `€${formatted}`;
    case 'RUB':
      return `${formatted} ₽`;
    case 'UZS':
      return `${formatted} UZS`;
    default:
      return `${formatted} ${currency}`;
  }
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { t } = useLanguage();

  const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <div
      onClick={onClick}
      className="group bg-zinc-900/90 border border-zinc-800/90 hover:border-[#EFBF04]/60 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col"
    >
      {/* Thumbnail area */}
      <div className="relative aspect-4/3 w-full bg-zinc-950 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
            <ImageOff className="h-8 w-8 mb-1" />
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">No Photo</span>
          </div>
        )}

        {/* Category tag on image */}
        {product.categoryName && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md text-[10px] font-semibold text-zinc-300 border border-zinc-800">
            {product.categoryName}
          </div>
        )}

        {/* Status badge if not active */}
        {product.status !== 'active' && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-amber-500/90 text-zinc-950 text-[10px] font-bold uppercase shadow">
            {t(product.status)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-[#EFBF04] transition-colors line-clamp-2 leading-snug mb-2">
            {product.title}
          </h3>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-base sm:text-lg font-bold text-white tracking-tight">
              {formatPrice(product.price, product.currency)}
            </div>
            {product.price === 0 && (
              <span className="text-[11px] text-[#EFBF04] font-medium">
                {t('negotiable_price')}
              </span>
            )}
          </div>

          <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5 truncate max-w-[150px]">
              <UserCheck className="h-3.5 w-3.5 text-[#EFBF04] shrink-0" />
              <span className="truncate">{product.sellerName}</span>
            </div>
            <span className="text-[10px] text-zinc-500 shrink-0">
              {new Date(product.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
