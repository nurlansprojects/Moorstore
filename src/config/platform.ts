import { Category } from '../types';

export const PLATFORM_NAME = 'Moorstore';
export const BRAND_COLOR = '#EFBF04';
export const OFFICIAL_LOGO_URL = '/moorstore.png';
export const DEFAULT_TELEGRAM_SELLER_URL = 'https://t.me/nurlandm';
export const ADMIN_EMAIL = 'dev.nurlan@gmail.com';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'gadgets',
    slug: 'gadgets',
    name: {
      ru: 'Гаджеты и электроника',
      uz: 'Gadjetlar va elektronika',
      en: 'Gadgets & Electronics'
    },
    icon: 'Smartphone',
    order: 1,
    isActive: true
  },
  {
    id: 'books',
    slug: 'books',
    name: {
      ru: 'Книги',
      uz: 'Kitoblar',
      en: 'Books'
    },
    icon: 'BookOpen',
    order: 2,
    isActive: true
  },
  {
    id: 'clothing',
    slug: 'clothing',
    name: {
      ru: 'Одежда и мода',
      uz: 'Kiyim va moda',
      en: 'Clothing & Fashion'
    },
    icon: 'Shirt',
    order: 3,
    isActive: true
  },
  {
    id: 'cars',
    slug: 'cars',
    name: {
      ru: 'Автомобили и транспорт',
      uz: 'Avtomobillar va transport',
      en: 'Cars & Vehicles'
    },
    icon: 'Car',
    order: 4,
    isActive: true
  },
  {
    id: 'realestate',
    slug: 'realestate',
    name: {
      ru: 'Недвижимость',
      uz: "Ko'chmas mulk",
      en: 'Houses & Real Estate'
    },
    icon: 'Home',
    order: 5,
    isActive: true
  },
  {
    id: 'home',
    slug: 'home',
    name: {
      ru: 'Дом и уют',
      uz: 'Uy va hayot',
      en: 'Home & Lifestyle'
    },
    icon: 'Sparkles',
    order: 6,
    isActive: true
  },
  {
    id: 'other',
    slug: 'other',
    name: {
      ru: 'Другие категории',
      uz: 'Boshqa toifalar',
      en: 'Other Categories'
    },
    icon: 'Grid',
    order: 7,
    isActive: true
  }
];
