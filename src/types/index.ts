export type UserRole = 'user' | 'seller' | 'admin';

export type Language = 'ru' | 'uz' | 'en';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export type Currency = 'USD' | 'UZS' | 'RUB' | 'EUR';

export type ContactType = 'telegram' | 'instagram' | 'email';

export interface ContactMethod {
  type: ContactType;
  value: string;
}

export type ProductStatus = 'active' | 'archived' | 'moderated';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: Currency;
  categoryId: string;
  categorySlug?: string;
  categoryName?: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhoto?: string;
  contactMethods: ContactMethod[];
  categoryFields?: Record<string, string | number | boolean>;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: {
    ru: string;
    uz: string;
    en: string;
  };
  icon: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
}

export interface SellerApplication {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface PlatformSettings {
  id: string;
  telegramSellerApplyUrl: string;
  platformName: string;
  contactEmail: string;
  updatedAt?: string;
}

export type ActiveTab =
  | 'home'
  | 'category'
  | 'product_detail'
  | 'account'
  | 'seller_apply'
  | 'seller_dashboard'
  | 'seller_create'
  | 'seller_edit'
  | 'seller_products'
  | 'admin_dashboard'
  | 'admin_applications'
  | 'admin_users'
  | 'admin_moderation'
  | 'admin_categories'
  | 'admin_settings';
