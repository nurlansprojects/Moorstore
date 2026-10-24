import React, { useState } from 'react';
import { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatPrice } from './ProductCard';
import {
  ArrowLeft,
  UserCheck,
  Calendar,
  Tag,
  Shield,
  Edit,
  Trash2,
  Send,
  Camera,
  Mail,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onBack,
  onEdit,
  onDelete,
}) => {
  const { user, isAdmin } = useAuth();
  const { lang, t } = useLanguage();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const isOwner = user?.uid === product.sellerId;
  const canManage = isOwner || isAdmin;

  // Safe external action handler (never reveals raw URL in text)
  const handleContactAction = (type: 'telegram' | 'instagram' | 'email', rawValue: string) => {
    let clean = (rawValue || '').trim();
    if (!clean) return;

    if (type === 'telegram') {
      // Remove @ or full url if user pasted it
      clean = clean.replace(/^(https?:\/\/)?(www\.)?t\.me\//i, '').replace(/^@/, '').trim();
      // Ensure only valid characters
      const sanitized = clean.replace(/[^a-zA-Z0-9_]/g, '');
      if (sanitized) {
        window.open(`https://t.me/${sanitized}`, '_blank', 'noopener,noreferrer');
      }
    } else if (type === 'instagram') {
      clean = clean.replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '').replace(/^@/, '').trim();
      const sanitized = clean.replace(/[^a-zA-Z0-9_.]/g, '');
      if (sanitized) {
        window.open(`https://instagram.com/${sanitized}`, '_blank', 'noopener,noreferrer');
      }
    } else if (type === 'email') {
      clean = clean.replace(/^(mailto:)/i, '').trim();
      const subject = encodeURIComponent(`Moorstore: ${product.title}`);
      window.location.href = `mailto:${clean}?subject=${subject}`;
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : [];
  const activeImage = images[selectedPhotoIndex] || null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top back button and action controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('back')}</span>
        </button>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(product)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>{t('edit')}</span>
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t('delete')}</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 w-full bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-contain bg-black/40"
              />
            ) : (
              <div className="text-zinc-600 flex flex-col items-center">
                <Tag className="h-12 w-12 mb-2" />
                <span className="text-xs">No image provided</span>
              </div>
            )}

            {/* Prev / Next buttons if multiple photos */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 text-white border border-zinc-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedPhotoIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 text-white border border-zinc-800 transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedPhotoIndex === idx
                      ? 'border-[#EFBF04] ring-2 ring-[#EFBF04]/30'
                      : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description Section */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 mt-6">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#EFBF04]" />
              <span>{t('listing_desc_label')}</span>
            </h2>
            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
              {product.description}
            </div>
          </div>
        </div>

        {/* Right Column: Key Details & Seller Contact Buttons (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Card */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            
            {/* Category badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
                {product.categoryName || 'Marketplace'}
              </span>
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(product.createdAt).toLocaleDateString()}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-4">
              {product.title}
            </h1>

            {/* Price */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-6 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-500 block mb-0.5">{t('price')}</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {formatPrice(product.price, product.currency)}
                </span>
              </div>
              {product.price === 0 && (
                <span className="text-xs text-[#EFBF04] font-bold bg-[#EFBF04]/10 px-2.5 py-1 rounded-md">
                  {t('negotiable_price')}
                </span>
              )}
            </div>

            {/* Category-specific specifications if present */}
            {product.categoryFields && Object.keys(product.categoryFields).length > 0 && (
              <div className="mb-6 pt-4 border-t border-zinc-800/80">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                  {t('product_specs')}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.categoryFields).map(([k, v]) => {
                    if (v === undefined || v === null || v === '') return null;
                    const labelKey = `field_${k}`;
                    const label = t(labelKey, k);
                    const displayVal = typeof v === 'boolean' ? (v ? 'Да' : 'Нет') : String(v);

                    return (
                      <div key={k} className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                        <span className="text-zinc-500 block text-[10px] mb-0.5">{label}</span>
                        <span className="text-zinc-200 font-semibold truncate block">{displayVal}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Seller Info Box */}
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 mb-6 flex items-center gap-3.5">
              {product.sellerPhoto ? (
                <img
                  src={product.sellerPhoto}
                  alt={product.sellerName}
                  className="h-12 w-12 rounded-xl object-cover ring-1 ring-zinc-700 shrink-0"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-[#EFBF04] text-base shrink-0">
                  {product.sellerName?.charAt(0) || 'S'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white truncate">{product.sellerName}</span>
                  <UserCheck className="h-4 w-4 text-[#EFBF04] shrink-0" />
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {t('role_seller')}
                </p>
              </div>
            </div>

            {/* 
              HIDDEN SELLER CONTACT LINKS
              Requirement 7:
              - Contact destinations must never be printed as raw URLs in the user interface.
              - Display clear buttons using translated labels ("Write to Telegram", "Write to Instagram", "Send Email")
              - Destination is strictly behind the pressable button.
            */}
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                {t('seller_contacts_title')}
              </h3>

              {product.contactMethods && product.contactMethods.length > 0 ? (
                <div className="space-y-2.5">
                  {product.contactMethods.map((cm, idx) => {
                    if (cm.type === 'telegram') {
                      return (
                        <button
                          key={idx}
                          onClick={() => handleContactAction('telegram', cm.value)}
                          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-[#0088cc]/90 hover:bg-[#0088cc] text-white font-bold text-xs tracking-wide shadow-md transition-all active:scale-[0.99] cursor-pointer"
                        >
                          <Send className="h-4 w-4" />
                          <span>{t('write_telegram')}</span>
                        </button>
                      );
                    } else if (cm.type === 'instagram') {
                      return (
                        <button
                          key={idx}
                          onClick={() => handleContactAction('instagram', cm.value)}
                          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-bold text-xs tracking-wide shadow-md transition-all active:scale-[0.99] cursor-pointer"
                        >
                          <Camera className="h-4 w-4" />
                          <span>{t('write_instagram')}</span>
                        </button>
                      );
                    } else if (cm.type === 'email') {
                      return (
                        <button
                          key={idx}
                          onClick={() => handleContactAction('email', cm.value)}
                          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs tracking-wide border border-zinc-700 shadow-md transition-all active:scale-[0.99] cursor-pointer"
                        >
                          <Mail className="h-4 w-4 text-[#EFBF04]" />
                          <span>{t('send_email')}</span>
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  {t('no_contacts_configured')}
                </p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
