import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { OFFICIAL_LOGO_URL, PLATFORM_NAME } from '../../config/platform';
import { ShieldCheck, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { signInWithGoogle, authError, clearAuthError } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    clearAuthError();
    try {
      await signInWithGoogle();
    } catch {
      // Handled in AuthContext
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d10] text-zinc-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient gold gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#EFBF04]/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Bar with Language Selector */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900/90 rounded-xl border border-zinc-800">
            <img
              src={OFFICIAL_LOGO_URL}
              alt={PLATFORM_NAME}
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        {/* Language switcher */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          {(['ru', 'uz', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                lang === l
                  ? 'bg-[#EFBF04] text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Main Sign In Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Centered Logo */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-inner">
              <img
                src={OFFICIAL_LOGO_URL}
                alt={PLATFORM_NAME}
                className="h-14 w-auto object-contain"
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              {t('sign_in_title')}
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t('sign_in_subtitle')}
            </p>
          </div>

          {/* Error alert if any */}
          {authError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{t(authError, 'Authentication error')}</span>
            </div>
          )}

          {/* Continue with Google Button */}
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full group relative flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSigningIn ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {isSigningIn ? t('signing_in') : t('continue_with_google')}
            </span>
          </button>

          {/* Highlights */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-[#EFBF04] shrink-0" />
              <span>{t('seller_contacts_title')} — прямое общение без посредников</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <Sparkles className="h-4 w-4 text-[#EFBF04] shrink-0" />
              <span>Только проверенные продавцы с подтвержденным статусом</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <MessageSquare className="h-4 w-4 text-[#EFBF04] shrink-0" />
              <span>Удобная связь через Telegram, Instagram или почту</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-zinc-500 relative z-10">
        <p>© {new Date().getFullYear()} {PLATFORM_NAME}. {t('all_rights_reserved')}</p>
      </footer>
    </div>
  );
};
