import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../config/firebase';
import { Category, PlatformSettings, SellerApplication, UserProfile, UserRole } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_TELEGRAM_SELLER_URL, PLATFORM_NAME } from '../config/platform';

export async function fetchAllUsers(): Promise<UserProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const users: UserProfile[] = [];
    snap.forEach((d) => {
      users.push({ id: d.id, ...d.data() } as UserProfile);
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

export async function fetchSellerApplications(): Promise<SellerApplication[]> {
  try {
    const snap = await getDocs(collection(db, 'seller_applications'));
    const apps: SellerApplication[] = [];
    snap.forEach((d) => {
      apps.push({ id: d.id, ...d.data() } as SellerApplication);
    });
    return apps.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'seller_applications');
  }
}

export async function submitSellerApplication(appData: {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  note?: string;
}): Promise<void> {
  try {
    const appRef = doc(db, 'seller_applications', appData.userId);
    const payload: SellerApplication = {
      id: appData.userId,
      userId: appData.userId,
      displayName: appData.displayName,
      email: appData.email,
      photoURL: appData.photoURL,
      note: appData.note || '',
      status: 'pending',
      appliedAt: new Date().toISOString()
    };
    await setDoc(appRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `seller_applications/${appData.userId}`);
  }
}

export async function updateSellerApplicationStatus(
  applicationId: string,
  userId: string,
  status: 'approved' | 'rejected',
  adminUid: string
): Promise<void> {
  try {
    const appRef = doc(db, 'seller_applications', applicationId);
    await updateDoc(appRef, {
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminUid
    });

    if (status === 'approved') {
      await updateUserRole(userId, 'seller');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `seller_applications/${applicationId}`);
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    if (snap.empty) {
      // Return defaults if database is not initialized yet
      return DEFAULT_CATEGORIES;
    }
    const categories: Category[] = [];
    snap.forEach((d) => {
      categories.push({ id: d.id, ...d.data() } as Category);
    });
    return categories.sort((a, b) => a.order - b.order);
  } catch {
    // Fallback gracefully to default system categories
    return DEFAULT_CATEGORIES;
  }
}

export async function initializeCategoriesIfEmpty(): Promise<Category[]> {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    if (snap.empty) {
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
      return DEFAULT_CATEGORIES;
    }
    const categories: Category[] = [];
    snap.forEach((d) => {
      categories.push({ id: d.id, ...d.data() } as Category);
    });
    return categories.sort((a, b) => a.order - b.order);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export async function saveCategory(category: Category): Promise<void> {
  try {
    const catRef = doc(db, 'categories', category.id);
    await setDoc(catRef, category, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `categories/${category.id}`);
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const catRef = doc(db, 'categories', categoryId);
    await deleteDoc(catRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `categories/${categoryId}`);
  }
}

export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  try {
    const docRef = doc(db, 'platform_settings', 'global');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PlatformSettings;
    }
    return {
      id: 'global',
      telegramSellerApplyUrl: DEFAULT_TELEGRAM_SELLER_URL,
      platformName: PLATFORM_NAME,
      contactEmail: 'dev.nurlan@gmail.com',
    };
  } catch {
    return {
      id: 'global',
      telegramSellerApplyUrl: DEFAULT_TELEGRAM_SELLER_URL,
      platformName: PLATFORM_NAME,
      contactEmail: 'dev.nurlan@gmail.com',
    };
  }
}

export async function savePlatformSettings(settings: Partial<PlatformSettings>): Promise<void> {
  try {
    const docRef = doc(db, 'platform_settings', 'global');
    await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'platform_settings/global');
  }
}
