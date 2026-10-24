import React from 'react';
import { OFFICIAL_LOGO_URL, PLATFORM_NAME, DEFAULT_TELEGRAM_SELLER_URL } from '../../config/platform';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Award, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenSellerApply: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSellerApply }) => {
  const { t } = useLanguage();
  const { isSeller } = useAuth();

  return (
    <footer className="w-full bg-[#090a0d] border-t border-zinc-800/80 text-zinc-400 text-xs py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand block */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 shrink-0">
            <img
              src={OFFICIAL_LOGO_URL}
              alt={PLATFORM_NAME}
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-white text-sm">{PLATFORM_NAME}</span>
              <span className="text-[10px] text-[#EFBF04] font-semibold tracking-wider uppercase bg-[#EFBF04]/10 px-1.5 py-0.5 rounded">
                Direct Marketplace
              </span>
            </div>
            <p className="text-zinc-500 mt-1 max-w-sm">
              {t('footer_text')}
            </p>
          </div>
        </div>

        {/* Action button: Apply for seller role behind button */}
        {!isSeller && (
          <div className="flex flex-col items-center sm:items-end gap-1.5">
            <button
              onClick={onOpenSellerApply}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-[#EFBF04] border border-[#EFBF04]/40 hover:border-[#EFBF04] transition-all font-semibold text-xs cursor-pointer shadow-sm"
            >
              <Award className="h-4 w-4" />
              <span>{t('seller_apply_btn')}</span>
            </button>
            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-[#EFBF04]" />
              <span>{t('seller_apply_notice')}</span>
            </p>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500">
        <p>© {new Date().getFullYear()} {PLATFORM_NAME}. {t('all_rights_reserved')}</p>
        <p className="text-[11px] text-zinc-600">
          Built with gold standard performance and direct customer communication.
        </p>
      </div>
    </footer>
  );
};
