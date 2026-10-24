import React from 'react';
import { OFFICIAL_LOGO_URL, PLATFORM_NAME } from '../../config/platform';
import { useLanguage } from '../../context/LanguageContext';

export const LoadingScreen: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0c0d10] text-zinc-100 px-4">
      <div className="relative flex flex-col items-center">
        {/* Logo with subtle gold ambient glow */}
        <div className="relative mb-6 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-2xl">
          <img
            src={OFFICIAL_LOGO_URL}
            alt={PLATFORM_NAME}
            className="h-16 w-auto max-w-[200px] object-contain"
          />
        </div>

        {/* Gold spinner ring */}
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#EFBF04] border-t-transparent" />
          <span className="text-sm tracking-wide text-zinc-400 font-medium">
            {t('loading', 'Загрузка...')}
          </span>
        </div>
      </div>
    </div>
  );
};
