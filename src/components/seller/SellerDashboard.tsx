import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchSellerProducts, deleteProduct } from '../../services/productService';
import { formatPrice } from '../marketplace/ProductCard';
import { EmptyState } from '../common/EmptyState';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Package,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface SellerDashboardProps {
  onCreateClick: () => void;
  onEditClick: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  onCreateClick,
  onEditClick,
  onViewProduct,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await fetchSellerProducts(user.uid);
      setProducts(items);
    } catch (err) {
      console.error("Error loading seller products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteProduct(deleteTargetId);
      setProducts(products.filter((p) => p.id !== deleteTargetId));
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteTargetId(null);
    }
  };

  const activeCount = products.filter((p) => p.status === 'active').length;
  const totalValue = products.reduce((acc, curr) => acc + (curr.price || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header banner */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#EFBF04] bg-[#EFBF04]/10 px-2 py-0.5 rounded">
              Seller Hub
            </span>
            <ShieldCheck className="h-4 w-4 text-[#EFBF04]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('seller_dashboard_title')}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            {t('seller_dashboard_subtitle')}
          </p>
        </div>

        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#EFBF04] hover:bg-[#dcae03] text-zinc-950 font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{t('nav_create_listing')}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-zinc-800 text-[#EFBF04]">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">{t('total_listings')}</p>
            <p className="text-2xl font-bold text-white">{products.length}</p>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">{t('active_listings')}</p>
            <p className="text-2xl font-bold text-white">{activeCount}</p>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#EFBF04]/10 text-[#EFBF04]">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">{t('total_catalog_value')}</p>
            <p className="text-2xl font-bold text-white">
              ${new Intl.NumberFormat('ru-RU').format(totalValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Listings Table / Cards */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {t('nav_my_listings')} ({products.length})
          </h2>
          {products.length > 0 && (
            <button
              onClick={onCreateClick}
              className="text-xs font-semibold text-[#EFBF04] hover:underline"
            >
              + {t('nav_create_listing')}
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#EFBF04] border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title={t('empty_no_seller_products')}
            description={t('empty_no_seller_products_desc')}
            actionText={t('nav_create_listing')}
            onAction={onCreateClick}
          />
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 transition-colors gap-4"
              >
                <div
                  onClick={() => onViewProduct(p)}
                  className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                >
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
                    <h3 className="text-sm font-semibold text-white truncate hover:text-[#EFBF04] transition-colors">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-[#EFBF04]">
                        {formatPrice(p.price, p.currency)}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-[11px] text-zinc-400">
                        {p.categoryName || p.categoryId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    p.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {t(p.status)}
                  </span>

                  <button
                    onClick={() => onViewProduct(p)}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                    title={t('view_details')}
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onEditClick(p)}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                    title={t('edit')}
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setDeleteTargetId(p.id)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
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

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title={t('delete_confirm_title')}
        description={t('delete_confirm_desc')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
