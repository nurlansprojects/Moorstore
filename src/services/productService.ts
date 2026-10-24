import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../config/firebase';
import { Product } from '../types';

const PRODUCTS_COLLECTION = 'products';

export async function fetchAllActiveProducts(): Promise<Product[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    const products: Product[] = [];
    snap.forEach((d) => {
      products.push({ id: d.id, ...d.data() } as Product);
    });
    // Sort client-side by date descending to avoid multi-field index requirements
    return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
  }
}

export function subscribeToActiveProducts(onUpdate: (products: Product[]) => void, onError?: (err: Error) => void) {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('status', '==', 'active')
    );
    return onSnapshot(
      q,
      (snap) => {
        const products: Product[] = [];
        snap.forEach((d) => {
          products.push({ id: d.id, ...d.data() } as Product);
        });
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(products);
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
  }
}

export async function fetchSellerProducts(sellerId: string): Promise<Product[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('sellerId', '==', sellerId)
    );
    const snap = await getDocs(q);
    const products: Product[] = [];
    snap.forEach((d) => {
      products.push({ id: d.id, ...d.data() } as Product);
    });
    return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
  }
}

export async function fetchAllProductsForAdmin(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const products: Product[] = [];
    snap.forEach((d) => {
      products.push({ id: d.id, ...d.data() } as Product);
    });
    return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
  }
}

export async function fetchProductById(productId: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Product;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const productId = 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const now = new Date().toISOString();
  const newProduct: Product = {
    ...productData,
    id: productId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, PRODUCTS_COLLECTION, productId), newProduct);
    return productId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

export async function updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}
