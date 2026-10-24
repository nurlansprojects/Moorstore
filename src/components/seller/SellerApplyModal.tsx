import React, { useState } from 'react';
import { X, Award, ShieldCheck, CheckCircle2, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { DEFAULT_TELEGRAM_SELLER_URL, OFFICIAL_LOGO_URL, PLATFORM_NAME } from '../../config/platform';
import { submitSellerApplication } from '../../services/adminService';

interface SellerApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramUrl?: string;
}

export const SellerApplyModal: React.FC<SellerApplyModalProps> = ({
  isOpen,
  onClose,
  telegramUrl = DEFAULT_TELEGRAM_SELLER_URL,
}) => {
  const { user, userProfile } = useAuth();
  const { t } = useLanguage();
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApply = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      // Record application in Firestore for administrator review
      await submitSellerApplication({
        userId: user.uid,
        displayName: user.displayName || userProfile?.displayName || 'User',
        email: user.email || userProfile?.email || '',
        photoURL: user.photoURL || userProfile?.photoURL,
        note,
      });

      // Safely open the configured Telegram destination behind the pressable button
      window.open(telegramUrl, '_blank', 'noopener,noreferrer');
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting seller application:", err);
      // Still open telegram if db write failed
      window.open(telegramUrl, '_blank', 'noopener,noreferrer');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800">
            <img src={OFFICIAL_LOGO_URL} alt={PLATFORM_NAME} className="h-7 w-auto object-contain" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#EFBF04] bg-[#EFBF04]/10 px-2 py-0.5 rounded">
              Verified Seller Status
            </span>
          </div>
        </div>

        {!submitted ? (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {t('seller_apply_title')}
            </h2>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              {t('seller_apply_desc')}
            </p>

            <div className="space-y-3.5 bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/80 mb-6">
              <div className="flex items-start gap-3 text-xs text-zinc-300">
                <ShieldCheck className="h-4 w-4 text-[#EFBF04] shrink-0 mt-0.5" />
                <span>
                  Прямой доступ к публикации объявлений во всех категориях маркетплейса
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs text-zinc-300">
                <Award className="h-4 w-4 text-[#EFBF04] shrink-0 mt-0.5" />
                <span>
                  Прямые контакты (Telegram, Instagram, Email) без посредников и комиссий
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Какие товары или категории вы планируете продавать? (опционально)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Например: электроника, гаджеты, оригинальные аксессуары..."
                className="w-full bg-zinc-950 text-xs text-zinc-200 placeholder-zinc-500 p-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-[#EFBF04]"
              />
            </div>

            {/* The configured button: kept strictly behind the pressable button */}
            <button
              onClick={handleApply}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#EFBF04] hover:bg-[#dcae03] text-zinc-950 font-bold text-sm shadow-lg transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>{t('seller_apply_btn')}</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-zinc-500 text-center mt-3">
              {t('seller_apply_notice')}
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="h-16 w-16 bg-[#EFBF04]/10 text-[#EFBF04] border border-[#EFBF04]/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Заявка отправлена!
            </h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6 leading-relaxed">
              {t('seller_apply_pending')}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              {t('close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
