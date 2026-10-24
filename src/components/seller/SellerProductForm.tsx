import React, { useState, useEffect } from 'react';
import { Category, ContactMethod, ContactType, Currency, Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ImageUploader } from '../common/ImageUploader';
import { createProduct, updateProduct } from '../../services/productService';
import { ProductCard } from '../marketplace/ProductCard';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Eye,
  Send,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';

interface SellerProductFormProps {
  initialProduct?: Product | null;
  categories: Category[];
  onSuccess: (savedProduct: Product) => void;
  onCancel: () => void;
}

export const SellerProductForm: React.FC<SellerProductFormProps> = ({
  initialProduct,
  categories,
  onSuccess,
  onCancel,
}) => {
  const { user, userProfile } = useAuth();
  const { lang, t } = useLanguage();

  const isEdit = Boolean(initialProduct);

  const [title, setTitle] = useState(initialProduct?.title || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [price, setPrice] = useState<string>(
    initialProduct?.price !== undefined ? String(initialProduct.price) : ''
  );
  const [currency, setCurrency] = useState<Currency>(initialProduct?.currency || 'USD');
  const [categoryId, setCategoryId] = useState<string>(
    initialProduct?.categoryId || (categories.length > 0 ? categories[0].id : 'gadgets')
  );
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>(
    initialProduct?.contactMethods?.length
      ? initialProduct.contactMethods
      : [{ type: 'telegram', value: '' }]
  );

  // Category specific fields
  const [categoryFields, setCategoryFields] = useState<Record<string, any>>(
    initialProduct?.categoryFields || {}
  );

  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  // Contact methods helper
  const addContactMethod = () => {
    if (contactMethods.length >= 3) return;
    const existingTypes = contactMethods.map((c) => c.type);
    const availableType: ContactType =
      !existingTypes.includes('telegram')
        ? 'telegram'
        : !existingTypes.includes('instagram')
        ? 'instagram'
        : 'email';
    setContactMethods([...contactMethods, { type: availableType, value: '' }]);
  };

  const removeContactMethod = (index: number) => {
    if (contactMethods.length <= 1) return;
    setContactMethods(contactMethods.filter((_, i) => i !== index));
  };

  const updateContactMethod = (index: number, field: 'type' | 'value', val: string) => {
    const updated = [...contactMethods];
    if (field === 'type') {
      updated[index].type = val as ContactType;
    } else {
      updated[index].value = val;
    }
    setContactMethods(updated);
  };

  const handleCategoryFieldChange = (key: string, val: any) => {
    setCategoryFields((prev) => ({ ...prev, [key]: val }));
  };

  // Validate form
  const validate = (): string | null => {
    if (!title.trim() || title.trim().length < 2) {
      return 'Пожалуйста, укажите название товара (минимум 2 символа)';
    }
    if (!description.trim() || description.trim().length < 5) {
      return 'Пожалуйста, укажите описание товара (минимум 5 символов)';
    }
    if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
      return 'Пожалуйста, укажите корректную цену (0 для договорной)';
    }
    if (!categoryId) {
      return 'Пожалуйста, выберите категорию';
    }
    if (images.length === 0) {
      return t('at_least_one_photo_required');
    }
    const validContacts = contactMethods.filter((c) => c.value && c.value.trim().length > 0);
    if (validContacts.length === 0) {
      return t('at_least_one_contact_required');
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    if (!user) return;

    setLoading(true);

    const validContacts = contactMethods
      .filter((c) => c.value && c.value.trim().length > 0)
      .map((c) => ({
        type: c.type,
        value: c.value.trim(),
      }));

    const categoryObj = categories.find((c) => c.id === categoryId);
    const categoryName = categoryObj?.name?.[lang] || categoryObj?.name?.ru || categoryId;

    try {
      if (isEdit && initialProduct) {
        const updates: Partial<Product> = {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          currency,
          categoryId,
          categorySlug: categoryObj?.slug || categoryId,
          categoryName,
          images,
          contactMethods: validContacts,
          categoryFields,
        };
        await updateProduct(initialProduct.id, updates);
        onSuccess({ ...initialProduct, ...updates, updatedAt: new Date().toISOString() });
      } else {
        const newProductPayload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          currency,
          categoryId,
          categorySlug: categoryObj?.slug || categoryId,
          categoryName,
          images,
          sellerId: user.uid,
          sellerName: user.displayName || userProfile?.displayName || 'Seller',
          sellerEmail: user.email || userProfile?.email || '',
          sellerPhoto: user.photoURL || userProfile?.photoURL,
          contactMethods: validContacts,
          categoryFields,
          status: 'active',
        };
        const newId = await createProduct(newProductPayload);
        onSuccess({
          ...newProductPayload,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err: unknown) {
      console.error("Save product error:", err);
      setErrorMsg(err instanceof Error ? err.message : 'Ошибка при сохранении объявления');
    } finally {
      setLoading(false);
    }
  };

  // Dummy product for live preview
  const previewProduct: Product = {
    id: initialProduct?.id || 'preview_id',
    title: title || 'Название товара',
    description: description || 'Описание товара...',
    price: Number(price) || 0,
    currency,
    categoryId,
    categoryName: selectedCategory?.name?.[lang] || selectedCategory?.name?.ru || categoryId,
    images: images.length > 0 ? images : [],
    sellerId: user?.uid || '',
    sellerName: user?.displayName || userProfile?.displayName || 'Продавец',
    sellerEmail: user?.email || '',
    sellerPhoto: user?.photoURL || undefined,
    contactMethods,
    categoryFields,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('cancel')}</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {isEdit ? t('edit_listing_title') : t('create_listing_title')}
        </h1>

        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Eye className="h-4 w-4 text-[#EFBF04]" />
          <span>{isPreview ? t('edit') : t('preview')}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preview Screen */}
      {isPreview ? (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
            <h2 className="text-sm font-bold text-[#EFBF04] uppercase tracking-wider flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Режим предварительного просмотра</span>
            </h2>
            <button
              onClick={() => setIsPreview(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Вернуться к редактированию
            </button>
          </div>

          <div className="max-w-sm mx-auto mb-8">
            <p className="text-xs text-zinc-400 text-center mb-3">Вид карточки в каталоге:</p>
            <ProductCard product={previewProduct} onClick={() => {}} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              onClick={() => setIsPreview(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 text-white"
            >
              {t('edit')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#EFBF04] hover:bg-[#dcae03] text-zinc-950 shadow-md flex items-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>{isEdit ? t('save') : t('publish')}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Edit / Create Form */
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic info */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-[#EFBF04]/10 text-[#EFBF04] flex items-center justify-center text-xs font-bold">1</span>
              <span>{t('form_step_basic')}</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {t('listing_title_label')} *
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('listing_title_placeholder')}
                className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 px-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-[#EFBF04]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {t('listing_desc_label')} *
              </label>
              <textarea
                required
                rows={5}
                maxLength={5000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('listing_desc_placeholder')}
                className="w-full bg-zinc-950 text-sm text-zinc-100 placeholder-zinc-500 p-4 rounded-xl border border-zinc-800 focus:outline-none focus:border-[#EFBF04] font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {t('listing_price_label')} *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0 для договорной"
                  className="w-full bg-zinc-950 text-sm text-zinc-100 px-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-[#EFBF04]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {t('currency')} *
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full bg-zinc-950 text-sm text-zinc-100 px-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-[#EFBF04] cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="UZS">UZS</option>
                  <option value="RUB">RUB (₽)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Category & Specs */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-[#EFBF04]/10 text-[#EFBF04] flex items-center justify-center text-xs font-bold">2</span>
              <span>{t('form_step_category')}</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {t('listing_category_label')} *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-zinc-950 text-sm text-zinc-100 px-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-[#EFBF04] cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name?.[lang] || c.name?.ru || c.slug}
                  </option>
                ))}
              </select>
            </div>

            {/* Category-specific fields */}
            {categoryId === 'cars' && (
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-4">
                <p className="text-xs font-semibold text-[#EFBF04]">Характеристики автомобиля:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">{t('field_year')}</label>
                    <input
                      type="number"
                      placeholder="2023"
                      value={categoryFields.year || ''}
                      onChange={(e) => handleCategoryFieldChange('year', e.target.value)}
                      className="w-full bg-zinc-900 text-xs text-white p-2.5 rounded-lg border border-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">{t('field_mileage')}</label>
                    <input
                      type="number"
                      placeholder="15000"
                      value={categoryFields.mileage || ''}
                      onChange={(e) => handleCategoryFieldChange('mileage', e.target.value)}
                      className="w-full bg-zinc-900 text-xs text-white p-2.5 rounded-lg border border-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">{t('field_condition')}</label>
                    <select
                      value={categoryFields.condition || 'used'}
                      onChange={(e) => handleCategoryFieldChange('condition', e.target.value)}
                      className="w-full bg-zinc-900 text-xs text-white p-2.5 rounded-lg border border-zinc-800"
                    >
                      <option value="new">{t('field_condition_new')}</option>
                      <option value="used">{t('field_condition_used')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {categoryId === 'realestate' && (
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-4">
                <p className="text-xs font-semibold text-[#EFBF04]">Параметры недвижимости:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">{t('field_property_type')}</label>
                    <input
                      type="text"
                      placeholder="Квартира / Дом / Офис"
                      value={categoryFields.property_type || ''}
                      onChange={(e) => handleCategoryFieldChange('property_type', e.target.value)}
                      className="w-full bg-zinc-900 text-xs text-white p-2.5 rounded-lg border border-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">{t('field_area_sqm')}</label>
                    <input
                      type="number"
                      placeholder="75"
                      value={categoryFields.area_sqm || ''}
                      onChange={(e) => handleCategoryFieldChange('area_sqm', e.target.value)}
                      className="w-full bg-zinc-900 text-xs text-white p-2.5 rounded-lg border border-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">{t('field_rooms')}</label>
                    <input
                      type="number"
                      placeholder="3"
                      value={categoryFields.rooms || ''}
                      onChange={(e) => handleCategoryFieldChange('rooms', e.target.value)}
                      className="w-full bg-zinc-900 text-xs text-white p-2.5 rounded-lg border border-zinc-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {categoryId === 'gadgets' && (
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                <label className="text-[11px] text-zinc-400 block mb-1">{t('field_brand')}</label>
                <input
                  type="text"
                  placeholder="Apple, Samsung, Sony..."
                  value={categoryFields.brand || ''}
                  onChange={(e) => handleCategoryFieldChange('brand', e.target.value)}
                  className="w-full bg-zinc-900 text-xs text-white p-2.5 rounded-lg border border-zinc-800"
                />
              </div>
            )}
          </div>

          {/* Section 3: Photos */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-[#EFBF04]/10 text-[#EFBF04] flex items-center justify-center text-xs font-bold">3</span>
              <span>{t('form_step_photos')} *</span>
            </h2>

            <ImageUploader images={images} onChange={setImages} maxImages={8} />
          </div>

          {/* Section 4: Contact Methods */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-[#EFBF04]/10 text-[#EFBF04] flex items-center justify-center text-xs font-bold">4</span>
                <span>{t('form_step_contacts')} *</span>
              </h2>
              {contactMethods.length < 3 && (
                <button
                  type="button"
                  onClick={addContactMethod}
                  className="flex items-center gap-1.5 text-xs text-[#EFBF04] hover:underline font-semibold cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t('add_contact_method')}</span>
                </button>
              )}
            </div>

            <div className="p-3 bg-zinc-950/70 rounded-xl border border-zinc-800/80 text-xs text-zinc-400 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-[#EFBF04] shrink-0 mt-0.5" />
              <span>
                Покупатели не увидят ваши контакты в открытом виде. В объявлении будут только безопасные кнопки прямого перехода («Написать в Telegram», «Написать в Instagram», «Отправить Email»).
              </span>
            </div>

            <div className="space-y-3">
              {contactMethods.map((cm, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={cm.type}
                    onChange={(e) => updateContactMethod(idx, 'type', e.target.value)}
                    className="bg-zinc-950 text-xs text-zinc-200 px-3 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-[#EFBF04]"
                  >
                    <option value="telegram">Telegram</option>
                    <option value="instagram">Instagram</option>
                    <option value="email">Email</option>
                  </select>

                  <input
                    type="text"
                    required
                    value={cm.value}
                    onChange={(e) => updateContactMethod(idx, 'value', e.target.value)}
                    placeholder={
                      cm.type === 'telegram'
                        ? 'Никнейм в Telegram (например, user_name)'
                        : cm.type === 'instagram'
                        ? 'Профиль Instagram (например, shop_name)'
                        : 'Ваш рабочий email адрес'
                    }
                    className="flex-1 bg-zinc-950 text-xs text-zinc-100 placeholder-zinc-500 px-3.5 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-[#EFBF04]"
                  />

                  {contactMethods.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContactMethod(idx)}
                      className="p-2.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setIsPreview(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              <Eye className="h-4 w-4 text-[#EFBF04]" />
              <span>{t('preview')}</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#EFBF04] hover:bg-[#dcae03] text-zinc-950 font-bold text-sm shadow-xl transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>{isEdit ? t('save') : t('publish')}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
