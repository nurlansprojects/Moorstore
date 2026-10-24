import React, { useState, useEffect } from 'react';
import { Category, PlatformSettings, Product, SellerApplication, UserProfile, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  fetchAllUsers,
  updateUserRole,
  fetchSellerApplications,
  updateSellerApplicationStatus,
  fetchCategories,
  saveCategory,
  deleteCategory,
  fetchPlatformSettings,
  savePlatformSettings,
} from '../../services/adminService';
import { fetchAllProductsForAdmin, updateProduct, deleteProduct } from '../../services/productService';
import { formatPrice } from '../marketplace/ProductCard';
import { ConfirmModal } from '../common/ConfirmModal';
import { EmptyState } from '../common/EmptyState';
import {
  Shield,
  Users,
  Award,
  Package,
  Layers,
  Settings,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  ExternalLink,
  Save,
  Check
} from 'lucide-react';

interface AdminDashboardProps {
  onViewProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onCategoriesUpdated: () => void;
}

type AdminTab = 'overview' | 'applications' | 'users' | 'moderation' | 'categories' | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onViewProduct,
  onEditProduct,
  onCategoriesUpdated,
}) => {
  const { user, isAdmin } = useAuth();
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Data states
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Modals & form states
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatRu, setNewCatRu] = useState('');
  const [newCatUz, setNewCatUz] = useState('');
  const [newCatEn, setNewCatEn] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Tag');

  // Settings form
  const [telegramUrlInput, setTelegramUrlInput] = useState('');
  const [platformNameInput, setPlatformNameInput] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [appsData, usersData, prodsData, catsData, setsData] = await Promise.all([
        fetchSellerApplications(),
        fetchAllUsers(),
        fetchAllProductsForAdmin(),
        fetchCategories(),
        fetchPlatformSettings(),
      ]);

      setApplications(appsData);
      setUsers(usersData);
      setProducts(prodsData);
      setCategories(catsData);
      setSettings(setsData);
      if (setsData) {
        setTelegramUrlInput(setsData.telegramSellerApplyUrl || '');
        setPlatformNameInput(setsData.platformName || '');
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-sm text-zinc-400">
          This dashboard is strictly restricted to the authorized Moorstore administrator account.
        </p>
      </div>
    );
  }

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Seller Application actions
  const handleApproveApplication = async (app: SellerApplication) => {
    if (!user) return;
    try {
      await updateSellerApplicationStatus(app.id, app.userId, 'approved', user.uid);
      setApplications(
        applications.map((a) => (a.id === app.id ? { ...a, status: 'approved' } : a))
      );
      setUsers(
        users.map((u) => (u.id === app.userId ? { ...u, role: 'seller' } : u))
      );
      showNotification(`Статус продавца успешно одобрен для ${app.displayName}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectApplication = async (app: SellerApplication) => {
    if (!user) return;
    try {
      await updateSellerApplicationStatus(app.id, app.userId, 'rejected', user.uid);
      setApplications(
        applications.map((a) => (a.id === app.id ? { ...a, status: 'rejected' } : a))
      );
      showNotification(`Заявка пользователя ${app.displayName} отклонена`);
    } catch (err) {
      console.error(err);
    }
  };

  // Role management
  const handleToggleRole = async (targetUser: UserProfile, newRole: UserRole) => {
    try {
      await updateUserRole(targetUser.id, newRole);
      setUsers(users.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u)));
      showNotification(`Роль для ${targetUser.displayName} изменена на ${newRole}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Product moderation
  const handleToggleProductStatus = async (product: Product, newStatus: 'active' | 'moderated') => {
    try {
      await updateProduct(product.id, { status: newStatus });
      setProducts(
        products.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
      );
      showNotification(`Статус объявления изменен на ${newStatus}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProductConfirm = async () => {
    if (!deleteProductId) return;
    try {
      await deleteProduct(deleteProductId);
      setProducts(products.filter((p) => p.id !== deleteProductId));
      showNotification(t('listing_deleted_success'));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteProductId(null);
    }
  };

  // Category management
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatSlug.trim() || !newCatRu.trim()) return;

    const newCat: Category = {
      id: newCatSlug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, ''),
      slug: newCatSlug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, ''),
      name: {
        ru: newCatRu.trim(),
        uz: newCatUz.trim() || newCatRu.trim(),
        en: newCatEn.trim() || newCatRu.trim(),
      },
      icon: newCatIcon.trim() || 'Tag',
      order: categories.length + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveCategory(newCat);
      const updated = [...categories, newCat];
      setCategories(updated);
      setNewCatOpen(false);
      setNewCatSlug('');
      setNewCatRu('');
      setNewCatUz('');
      setNewCatEn('');
      onCategoriesUpdated();
      showNotification('Категория успешно добавлена!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCategoryActive = async (cat: Category) => {
    const updated = { ...cat, isActive: !cat.isActive };
    try {
      await saveCategory(updated);
      setCategories(categories.map((c) => (c.id === cat.id ? updated : c)));
      onCategoriesUpdated();
      showNotification(`Категория ${updated.isActive ? 'активирована' : 'деактивирована'}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Settings save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePlatformSettings({
        telegramSellerApplyUrl: telegramUrlInput.trim(),
        platformName: platformNameInput.trim() || 'Moorstore',
      });
      showNotification(t('settings_saved'));
    } catch (err) {
      console.error(err);
    }
  };

  const pendingApps = applications.filter((a) => a.status === 'pending');
  const sellersCount = users.filter((u) => u.role === 'seller').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                Master Administrator
              </span>
              <span className="text-xs text-zinc-500">• {user?.email}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('admin_dashboard_title')}
            </h1>
          </div>
        </div>

        <button
          onClick={loadAllData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Обновить данные</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-[#EFBF04]/10 border border-[#EFBF04]/30 text-[#EFBF04] text-xs font-semibold flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-zinc-800 pb-3">
        {[
          { id: 'overview', label: t('admin_tab_overview'), icon: Layers },
          { id: 'applications', label: `${t('admin_tab_applications')} (${pendingApps.length})`, icon: Award },
          { id: 'users', label: t('admin_tab_users'), icon: Users },
          { id: 'moderation', label: t('admin_tab_moderation'), icon: Package },
          { id: 'categories', label: t('admin_tab_categories'), icon: Layers },
          { id: 'settings', label: t('admin_tab_settings'), icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-100 text-zinc-950 font-bold shadow'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs text-zinc-400">{t('total_users_count')}</p>
              <p className="text-3xl font-extrabold text-white mt-1">{users.length}</p>
            </div>
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs text-zinc-400">{t('total_sellers_count')}</p>
              <p className="text-3xl font-extrabold text-[#EFBF04] mt-1">{sellersCount}</p>
            </div>
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs text-zinc-400">{t('total_products_count')}</p>
              <p className="text-3xl font-extrabold text-white mt-1">{products.length}</p>
            </div>
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5">
              <p className="text-xs text-zinc-400">{t('pending_applications')}</p>
              <p className="text-3xl font-extrabold text-amber-400 mt-1">{pendingApps.length}</p>
            </div>
          </div>

          {/* Quick pending applications preview */}
          {pendingApps.length > 0 && (
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#EFBF04]" />
                  <span>Заявки, требующие рассмотрения ({pendingApps.length})</span>
                </h2>
                <button
                  onClick={() => setActiveTab('applications')}
                  className="text-xs text-[#EFBF04] hover:underline"
                >
                  Все заявки →
                </button>
              </div>

              <div className="space-y-3">
                {pendingApps.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {app.photoURL ? (
                        <img src={app.photoURL} alt="" className="h-10 w-10 rounded-xl object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-[#EFBF04]">
                          {app.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-white">{app.displayName}</p>
                        <p className="text-xs text-zinc-400">{app.email}</p>
                        {app.note && <p className="text-xs text-zinc-500 italic mt-0.5">«{app.note}»</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveApplication(app)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EFBF04] hover:bg-[#dcae03] text-zinc-950 text-xs font-bold transition-all cursor-pointer shadow"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>{t('approve')}</span>
                      </button>
                      <button
                        onClick={() => handleRejectApplication(app)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>{t('reject')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: SELLER APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {t('admin_tab_applications')} ({applications.length})
          </h2>

          {applications.length === 0 ? (
            <EmptyState
              title={t('empty_no_applications')}
              description={t('empty_no_applications_desc')}
            />
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {app.photoURL ? (
                      <img src={app.photoURL} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-[#EFBF04]">
                        {app.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{app.displayName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          app.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : app.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">{app.email}</p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Подана: {new Date(app.appliedAt).toLocaleString()}
                      </p>
                      {app.note && (
                        <p className="text-xs text-zinc-400 mt-1 bg-zinc-900 p-2 rounded-lg">
                          Заметка: {app.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {app.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApproveApplication(app)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EFBF04] hover:bg-[#dcae03] text-zinc-950 text-xs font-bold shadow transition-all cursor-pointer"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>{t('approve')}</span>
                        </button>
                        <button
                          onClick={() => handleRejectApplication(app)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>{t('reject')}</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleApproveApplication(app)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
                      >
                        Пересмотреть статус
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {t('admin_tab_users')} ({users.length})
          </h2>

          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  {u.photoURL ? (
                    <img src={u.photoURL} alt="" className="h-10 w-10 rounded-xl object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-[#EFBF04]">
                      {u.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{u.displayName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : u.role === 'seller'
                          ? 'bg-[#EFBF04]/10 text-[#EFBF04] border border-[#EFBF04]/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{u.email}</p>
                  </div>
                </div>

                {/* Role Switcher */}
                {u.email !== user?.email && (
                  <div className="flex items-center gap-2">
                    {u.role !== 'seller' ? (
                      <button
                        onClick={() => handleToggleRole(u, 'seller')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-[#EFBF04] hover:text-zinc-950 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>{t('grant_seller')}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleRole(u, 'user')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-500 hover:text-white text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <UserX className="h-3.5 w-3.5" />
                        <span>{t('revoke_seller')}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: PRODUCT MODERATION */}
      {activeTab === 'moderation' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {t('admin_tab_moderation')} ({products.length})
          </h2>

          {products.length === 0 ? (
            <EmptyState
              title={t('empty_no_products')}
              description="В маркетплейсе пока нет объявлений."
            />
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-14 w-14 rounded-xl bg-zinc-900 overflow-hidden shrink-0 border border-zinc-800">
                      {p.images && p.images[0] ? (
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{p.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                        <span className="font-bold text-[#EFBF04]">{formatPrice(p.price, p.currency)}</span>
                        <span>•</span>
                        <span>{p.categoryName || p.categoryId}</span>
                        <span>•</span>
                        <span>Продавец: {p.sellerName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleToggleProductStatus(p, p.status === 'active' ? 'moderated' : 'active')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        p.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                      }`}
                    >
                      {p.status === 'active' ? 'Активен (Скрыть)' : 'Скрыт (Опубликовать)'}
                    </button>

                    <button
                      onClick={() => onViewProduct(p)}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 cursor-pointer"
                      title={t('view_details')}
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onEditProduct(p)}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 cursor-pointer"
                      title={t('edit')}
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setDeleteProductId(p.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer"
                      title={t('delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t('admin_tab_categories')} ({categories.length})
            </h2>
            <button
              onClick={() => setNewCatOpen(!newCatOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EFBF04] hover:bg-[#dcae03] text-zinc-950 font-bold text-xs shadow cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{t('add_category')}</span>
            </button>
          </div>

          {/* Add category form modal/box */}
          {newCatOpen && (
            <form onSubmit={handleAddCategory} className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Новая категория каталога</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">{t('category_slug')} (e.g. sports)</label>
                  <input
                    type="text"
                    required
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="w-full bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">{t('category_icon')} (Lucide name, e.g. Tag, Car, Home)</label>
                  <input
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">{t('category_name_ru')}</label>
                  <input
                    type="text"
                    required
                    value={newCatRu}
                    onChange={(e) => setNewCatRu(e.target.value)}
                    className="w-full bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">{t('category_name_uz')}</label>
                  <input
                    type="text"
                    value={newCatUz}
                    onChange={(e) => setNewCatUz(e.target.value)}
                    className="w-full bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">{t('category_name_en')}</label>
                  <input
                    type="text"
                    value={newCatEn}
                    onChange={(e) => setNewCatEn(e.target.value)}
                    className="w-full bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewCatOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs text-zinc-300"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#EFBF04] text-xs font-bold text-zinc-950"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {cat.name?.[lang] || cat.name?.ru || cat.slug}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">({cat.slug})</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    RU: {cat.name?.ru} | UZ: {cat.name?.uz} | EN: {cat.name?.en}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleCategoryActive(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      cat.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {cat.isActive ? 'Активна' : 'Отключена'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {t('admin_tab_settings')}
          </h2>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              {t('telegram_seller_url_label')}
            </label>
            <input
              type="text"
              required
              value={telegramUrlInput}
              onChange={(e) => setTelegramUrlInput(e.target.value)}
              className="w-full bg-zinc-950 text-xs text-zinc-100 p-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-[#EFBF04] font-mono"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Эта ссылка скрыта от пользователей в интерфейсе и активируется только при нажатии на кнопку «Подать заявку на статус продавца».
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Название платформы
            </label>
            <input
              type="text"
              required
              value={platformNameInput}
              onChange={(e) => setPlatformNameInput(e.target.value)}
              className="w-full bg-zinc-950 text-xs text-zinc-100 p-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-[#EFBF04]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#EFBF04] hover:bg-[#dcae03] text-zinc-950 font-bold text-xs shadow-md cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{t('save_settings')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Delete product confirm modal */}
      <ConfirmModal
        isOpen={Boolean(deleteProductId)}
        title={t('delete_confirm_title')}
        description={t('delete_confirm_desc')}
        onConfirm={handleDeleteProductConfirm}
        onCancel={() => setDeleteProductId(null)}
      />
    </div>
  );
};
