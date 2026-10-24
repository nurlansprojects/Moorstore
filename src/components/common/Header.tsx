import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { OFFICIAL_LOGO_URL, PLATFORM_NAME } from '../../config/platform';
import { ActiveTab, Language } from '../../types';
import {
  Search,
  PlusCircle,
  LayoutDashboard,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  Package,
  Globe,
  Award
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenSellerApply: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenSellerApply,
}) => {
  const { user, userProfile, isAdmin, isSeller, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: 'ru', label: 'Русский' },
    { code: 'uz', label: "O'zbekcha" },
    { code: 'en', label: 'English' },
  ];

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0c0d10]/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div
          onClick={() => handleNav('home')}
          className="flex items-center gap-3 cursor-pointer shrink-0 select-none group"
        >
          <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800/80 group-hover:border-[#EFBF04]/50 transition-colors shadow-sm">
            <img
              src={OFFICIAL_LOGO_URL}
              alt={PLATFORM_NAME}
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>
          <span className="hidden md:inline font-bold tracking-tight text-lg text-white group-hover:text-[#EFBF04] transition-colors">
            {PLATFORM_NAME}
          </span>
        </div>

        {/* Global Search Bar (visible on Home / Category / Search views) */}
        <div className="flex-1 max-w-xl mx-2 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'home' && activeTab !== 'category') {
                  setActiveTab('home');
                }
              }}
              placeholder={t('search_placeholder')}
              className="w-full bg-zinc-900/90 text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-[#EFBF04] focus:ring-1 focus:ring-[#EFBF04] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs px-1.5 py-0.5 rounded bg-zinc-800"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Desktop Navigation & Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Become a Seller button for regular users */}
          {!isSeller && !isAdmin && (
            <button
              onClick={onOpenSellerApply}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#EFBF04] border border-[#EFBF04]/40 hover:border-[#EFBF04] hover:bg-[#EFBF04]/10 transition-all cursor-pointer"
            >
              <Award className="h-4 w-4" />
              <span>{t('nav_become_seller')}</span>
            </button>
          )}

          {/* Seller / Admin Actions */}
          {isSeller && (
            <>
              <button
                onClick={() => handleNav('seller_create')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#EFBF04] hover:bg-[#dcae03] text-zinc-950 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>{t('nav_create_listing')}</span>
              </button>

              <button
                onClick={() => handleNav('seller_dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeTab.startsWith('seller_')
                    ? 'text-white bg-zinc-800 border border-zinc-700'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-[#EFBF04]" />
                <span>{t('nav_seller_dashboard')}</span>
              </button>
            </>
          )}

          {/* Admin Dashboard */}
          {isAdmin && (
            <button
              onClick={() => handleNav('admin_dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeTab.startsWith('admin_')
                  ? 'border-red-500/50 bg-red-500/10 text-red-300'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Shield className="h-4 w-4 text-red-400" />
              <span>{t('nav_admin_dashboard')}</span>
            </button>
          )}

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5 text-[#EFBF04]" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-1 z-50">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-zinc-800 transition-colors cursor-pointer ${
                      lang === l.code ? 'text-[#EFBF04] bg-zinc-800/50 font-semibold' : 'text-zinc-300'
                    }`}
                  >
                    <span>{l.label}</span>
                    {lang === l.code && <span className="h-1.5 w-1.5 rounded-full bg-[#EFBF04]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-800/80 transition-colors cursor-pointer border border-transparent hover:border-zinc-700"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-8 w-8 rounded-lg object-cover ring-1 ring-zinc-700"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-[#EFBF04]">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50">
                <div className="p-3 border-b border-zinc-800 mb-1">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-zinc-400 truncate mb-2">
                    {user?.email}
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                      : isSeller
                      ? 'bg-[#EFBF04]/10 text-[#EFBF04] border border-[#EFBF04]/30'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}>
                    {isAdmin ? t('role_admin') : isSeller ? t('role_seller') : t('role_user')}
                  </span>
                </div>

                <button
                  onClick={() => handleNav('account')}
                  className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4 text-zinc-400" />
                  <span>{t('nav_account')}</span>
                </button>

                {isSeller && (
                  <button
                    onClick={() => handleNav('seller_products')}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Package className="h-4 w-4 text-zinc-400" />
                    <span>{t('nav_my_listings')}</span>
                  </button>
                )}

                <div className="my-1 border-t border-zinc-800" />

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('sign_out')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile controls: language + burger */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Quick language toggle */}
          <button
            onClick={() => {
              const next: Record<Language, Language> = { ru: 'uz', uz: 'en', en: 'ru' };
              setLang(next[lang]);
            }}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-[#EFBF04]"
          >
            {lang.toUpperCase()}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 pb-3 sm:hidden">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'home' && activeTab !== 'category') {
                setActiveTab('home');
              }
            }}
            placeholder={t('search_placeholder')}
            className="w-full bg-zinc-900 text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-[#EFBF04]"
          />
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-[#0c0d10] px-4 py-4 space-y-3">
          {/* User snippet */}
          <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="h-10 w-10 rounded-lg" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-[#EFBF04]">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.displayName}</p>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                isAdmin ? 'text-red-400 bg-red-500/10' : isSeller ? 'text-[#EFBF04] bg-[#EFBF04]/10' : 'text-zinc-400 bg-zinc-800'
              }`}>
                {isAdmin ? t('role_admin') : isSeller ? t('role_seller') : t('role_user')}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => handleNav('home')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              {t('nav_home')}
            </button>

            {!isSeller && !isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSellerApply();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-[#EFBF04] bg-[#EFBF04]/10 border border-[#EFBF04]/30"
              >
                {t('nav_become_seller')}
              </button>
            )}

            {isSeller && (
              <>
                <button
                  onClick={() => handleNav('seller_create')}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold bg-[#EFBF04] text-zinc-950"
                >
                  + {t('nav_create_listing')}
                </button>
                <button
                  onClick={() => handleNav('seller_dashboard')}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-zinc-800"
                >
                  {t('nav_seller_dashboard')}
                </button>
                <button
                  onClick={() => handleNav('seller_products')}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-zinc-800"
                >
                  {t('nav_my_listings')}
                </button>
              </>
            )}

            {isAdmin && (
              <button
                onClick={() => handleNav('admin_dashboard')}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30"
              >
                {t('nav_admin_dashboard')}
              </button>
            )}

            <button
              onClick={() => handleNav('account')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-200 hover:bg-zinc-800"
            >
              {t('nav_account')}
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10"
            >
              {t('sign_out')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
