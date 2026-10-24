import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { OFFICIAL_LOGO_URL, PLATFORM_NAME } from '../../config/platform';
import { fetchSellerApplications } from '../../services/adminService';
import { SellerApplication } from '../../types';
import {
  User,
  Mail,
  ShieldCheck,
  Award,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  Clock,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

interface AccountPageProps {
  onOpenSellerApply: () => void;
  onNavigateSeller: () => void;
  onNavigateCreate: () => void;
  onNavigateAdmin: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onOpenSellerApply,
  onNavigateSeller,
  onNavigateCreate,
  onNavigateAdmin,
}) => {
  const { user, userProfile, isAdmin, isSeller, role, logout } = useAuth();
  const { t } = useLanguage();
  const [userApp, setUserApp] = useState<SellerApplication | null>(null);

  useEffect(() => {
    if (user && !isSeller) {
      fetchSellerApplications()
        .then((apps) => {
          const mine = apps.find((a) => a.userId === user.uid);
          if (mine) setUserApp(mine);
        })
        .catch(() => {});
    }
  }, [user, isSeller]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Profile Header Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="h-20 w-20 rounded-2xl object-cover ring-2 ring-[#EFBF04]/40 shrink-0"
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl font-bold text-[#EFBF04] shrink-0">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                {user?.displayName || 'User'}
              </h1>
              <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider mx-auto sm:mx-0 ${
                isAdmin
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : isSeller
                  ? 'bg-[#EFBF04]/10 text-[#EFBF04] border border-[#EFBF04]/30'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}>
                {isAdmin ? t('role_admin') : isSeller ? t('role_seller') : t('role_user')}
              </span>
            </div>

            <p className="text-xs text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5 mb-4">
              <Mail className="h-3.5 w-3.5" />
              <span>{user?.email}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              {isSeller && (
                <>
                  <button
                    onClick={onNavigateCreate}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EFBF04] text-zinc-950 font-bold text-xs shadow hover:bg-[#dcae03] cursor-pointer"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>{t('nav_create_listing')}</span>
                  </button>
                  <button
                    onClick={onNavigateSeller}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 text-white font-medium text-xs hover:bg-zinc-700 cursor-pointer"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-[#EFBF04]" />
                    <span>{t('nav_seller_dashboard')}</span>
                  </button>
                </>
              )}

              {isAdmin && (
                <button
                  onClick={onNavigateAdmin}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-semibold text-xs hover:bg-red-500/20 cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-red-400" />
                  <span>{t('nav_admin_dashboard')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seller Application Status Card (if normal user) */}
      {!isSeller && !isAdmin && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-[#EFBF04]" />
              <span>{t('seller_apply_title')}</span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            {t('seller_apply_desc')}
          </p>

          {userApp ? (
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
              {userApp.status === 'pending' ? (
                <>
                  <Clock className="h-5 w-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-400">Заявка на рассмотрении</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {t('seller_apply_pending')}
                    </p>
                  </div>
                </>
              ) : userApp.status === 'approved' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-400">Одобрено!</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{t('seller_apply_approved')}</p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <p className="text-xs text-red-400">Заявка была отклонена.</p>
                  <button
                    onClick={onOpenSellerApply}
                    className="text-xs text-[#EFBF04] hover:underline font-semibold"
                  >
                    Подать повторно
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenSellerApply}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#EFBF04] hover:bg-[#dcae03] text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <Award className="h-4 w-4" />
              <span>{t('seller_apply_btn')}</span>
            </button>
          )}
        </div>
      )}

      {/* Account Info Details */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
          {t('account_info')}
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
            <span className="text-zinc-400">{t('email_address')}</span>
            <span className="font-semibold text-white">{user?.email}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
            <span className="text-zinc-400">{t('your_role')}</span>
            <span className="font-semibold text-[#EFBF04]">
              {isAdmin ? t('role_admin') : isSeller ? t('role_seller') : t('role_user')}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
            <span className="text-zinc-400">Провайдер авторизации</span>
            <span className="font-semibold text-white">Google OAuth 2.0</span>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('sign_out')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
