import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ActiveTab, Category, Currency, Product } from './types';
import {
  fetchCategories,
  initializeCategoriesIfEmpty,
  fetchPlatformSettings,
} from './services/adminService';
import {
  fetchAllActiveProducts,
  subscribeToActiveProducts,
} from './services/productService';
import { testFirestoreConnection } from './config/firebase';
import { DEFAULT_CATEGORIES, DEFAULT_TELEGRAM_SELLER_URL } from './config/platform';

// Components
import { LoadingScreen } from './components/common/LoadingScreen';
import { SignInPage } from './components/common/SignInPage';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CategoryNav } from './components/marketplace/CategoryNav';
import { FilterBar, SortOption } from './components/marketplace/FilterBar';
import { ProductCard } from './components/marketplace/ProductCard';
import { ProductDetail } from './components/marketplace/ProductDetail';
import { EmptyState } from './components/common/EmptyState';
import { SellerApplyModal } from './components/seller/SellerApplyModal';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { SellerProductForm } from './components/seller/SellerProductForm';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AccountPage } from './components/account/AccountPage';
import { PackageOpen, Sparkles } from 'lucide-react';

function MarketplaceApp() {
  const { user, loading: authLoading, isSeller, isAdmin } = useAuth();
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Categories & Platform Settings
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [telegramUrl, setTelegramUrl] = useState(DEFAULT_TELEGRAM_SELLER_URL);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currency, setCurrency] = useState<Currency | 'ALL'>('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Seller Apply Modal
  const [sellerApplyOpen, setSellerApplyOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    testFirestoreConnection();

    // Load categories & platform settings
    initializeCategoriesIfEmpty().then((cats) => setCategories(cats));
    fetchPlatformSettings().then((s) => {
      if (s?.telegramSellerApplyUrl) setTelegramUrl(s.telegramSellerApplyUrl);
    });

    // Real-time subscription to active products
    const unsubscribe = subscribeToActiveProducts(
      (items) => {
        setProducts(items);
        setProductsLoading(false);
      },
      (err) => {
        console.error("Products subscription error:", err);
        setProductsLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleRefreshCategories = () => {
    fetchCategories().then((cats) => setCategories(cats));
  };

  // Filtered & Sorted products computation
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategoryId) {
      result = result.filter((p) => p.categoryId === selectedCategoryId);
    }

    // Search query filter (title and description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
    }

    // Currency filter
    if (currency !== 'ALL') {
      result = result.filter((p) => p.currency === currency);
    }

    // Min price filter
    if (minPrice && !isNaN(Number(minPrice))) {
      result = result.filter((p) => p.price >= Number(minPrice));
    }

    // Max price filter
    if (maxPrice && !isNaN(Number(maxPrice))) {
      result = result.filter((p) => p.price <= Number(maxPrice));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [products, selectedCategoryId, searchQuery, currency, minPrice, maxPrice, sortBy]);

  const hasActiveFilters = Boolean(
    selectedCategoryId ||
    searchQuery ||
    currency !== 'ALL' ||
    minPrice ||
    maxPrice ||
    sortBy !== 'newest'
  );

  const handleResetFilters = () => {
    setSelectedCategoryId(null);
    setSearchQuery('');
    setCurrency('ALL');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  // Navigations
  const handleOpenDetail = (p: Product) => {
    setSelectedProduct(p);
    setActiveTab('product_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartEdit = (p: Product) => {
    setEditingProduct(p);
    setActiveTab('seller_edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth check & Loading
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Mandatory Google Authentication requirement:
  if (!user) {
    return <SignInPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d10] text-zinc-100 font-sans selection:bg-[#EFBF04] selection:text-zinc-950">
      
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenSellerApply={() => setSellerApplyOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        
        {/* VIEW: HOME & DISCOVERY */}
        {(activeTab === 'home' || activeTab === 'category') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Category horizontal pills */}
            <CategoryNav
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={(id) => {
                setSelectedCategoryId(id);
                if (id) setActiveTab('category');
              }}
            />

            {/* Filter and Sorting Bar */}
            <FilterBar
              sortBy={sortBy}
              setSortBy={setSortBy}
              currency={currency}
              setCurrency={setCurrency}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              onReset={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Search or Category Title snippet */}
            {(searchQuery || selectedCategoryId) && (
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-2">
                <div>
                  {searchQuery && (
                    <span>
                      Результаты поиска по запросу «<strong className="text-white">{searchQuery}</strong>»:
                    </span>
                  )}
                  {selectedCategoryId && !searchQuery && (
                    <span>
                      Категория:{' '}
                      <strong className="text-[#EFBF04]">
                        {categories.find((c) => c.id === selectedCategoryId)?.name?.[lang] ||
                          categories.find((c) => c.id === selectedCategoryId)?.name?.ru}
                      </strong>
                    </span>
                  )}
                  <span className="ml-2 font-mono text-zinc-500">
                    ({filteredProducts.length})
                  </span>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[#EFBF04] hover:underline"
                  >
                    {t('reset_filters')}
                  </button>
                )}
              </div>
            )}

            {/* Product Grid */}
            {productsLoading ? (
              <div className="py-20 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#EFBF04] border-t-transparent" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon={<PackageOpen className="h-10 w-10" />}
                title={t('empty_no_products')}
                description={t('empty_no_products_desc')}
                actionText={hasActiveFilters ? t('reset_filters') : undefined}
                onAction={hasActiveFilters ? handleResetFilters : undefined}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onClick={() => handleOpenDetail(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: PRODUCT DETAIL */}
        {activeTab === 'product_detail' && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={() => setActiveTab('home')}
            onEdit={handleStartEdit}
            onDelete={() => {
              setSelectedProduct(null);
              setActiveTab('home');
            }}
          />
        )}

        {/* VIEW: CREATE PRODUCT */}
        {activeTab === 'seller_create' && isSeller && (
          <SellerProductForm
            categories={categories}
            onSuccess={(saved) => {
              setSelectedProduct(saved);
              setActiveTab('product_detail');
            }}
            onCancel={() => setActiveTab('seller_dashboard')}
          />
        )}

        {/* VIEW: EDIT PRODUCT */}
        {activeTab === 'seller_edit' && isSeller && editingProduct && (
          <SellerProductForm
            initialProduct={editingProduct}
            categories={categories}
            onSuccess={(saved) => {
              setSelectedProduct(saved);
              setEditingProduct(null);
              setActiveTab('product_detail');
            }}
            onCancel={() => {
              setEditingProduct(null);
              setActiveTab('seller_dashboard');
            }}
          />
        )}

        {/* VIEW: SELLER DASHBOARD / SELLER PRODUCTS */}
        {(activeTab === 'seller_dashboard' || activeTab === 'seller_products') && isSeller && (
          <SellerDashboard
            onCreateClick={() => setActiveTab('seller_create')}
            onEditClick={handleStartEdit}
            onViewProduct={handleOpenDetail}
          />
        )}

        {/* VIEW: ADMINISTRATOR DASHBOARD */}
        {activeTab === 'admin_dashboard' && isAdmin && (
          <AdminDashboard
            onViewProduct={handleOpenDetail}
            onEditProduct={handleStartEdit}
            onCategoriesUpdated={handleRefreshCategories}
          />
        )}

        {/* VIEW: ACCOUNT */}
        {activeTab === 'account' && (
          <AccountPage
            onOpenSellerApply={() => setSellerApplyOpen(true)}
            onNavigateSeller={() => setActiveTab('seller_dashboard')}
            onNavigateCreate={() => setActiveTab('seller_create')}
            onNavigateAdmin={() => setActiveTab('admin_dashboard')}
          />
        )}

      </main>

      {/* Seller Application Modal */}
      <SellerApplyModal
        isOpen={sellerApplyOpen}
        onClose={() => setSellerApplyOpen(false)}
        telegramUrl={telegramUrl}
      />

      {/* Global Footer */}
      <Footer onOpenSellerApply={() => setSellerApplyOpen(true)} />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MarketplaceApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
