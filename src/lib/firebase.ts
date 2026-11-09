import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  getDocFromServer,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

/**
 * Unified Real-Time Database Adapter (`ref`, `onValue`, `set`, `push`, `update`, `remove`, `get`)
 * backed by Cloud Firestore + real-time listeners so all store collections sync globally across
 * all devices in real time.
 */
export interface DbReference {
  path: string;
  collectionName: string;
  docId?: string;
}

export function ref(_dbInstance: unknown, path: string): DbReference {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const parts = clean.split('/');
  return {
    path: clean,
    collectionName: parts[0],
    docId: parts[1],
  };
}

export function onValue(
  reference: DbReference,
  callback: (snapshot: { val: () => any; exists: () => boolean }) => void
): () => void {
  const { collectionName, docId, path } = reference;

  if (docId) {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(
      docRef,
      (snap) => {
        const exists = snap.exists();
        const data = exists ? snap.data() : null;
        callback({
          exists: () => exists,
          val: () => data,
        });
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch {
          // Handled and logged
        }
      }
    );
  }

  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snap) => {
      const record: Record<string, any> = {};
      snap.forEach((docSnap) => {
        record[docSnap.id] = docSnap.data();
      });
      const hasItems = Object.keys(record).length > 0;
      callback({
        exists: () => hasItems,
        val: () => (hasItems ? record : null),
      });
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Handled and logged
      }
    }
  );
}

export async function set(reference: DbReference, value: any): Promise<void> {
  const { collectionName, docId, path } = reference;
  try {
    if (docId) {
      await setDoc(doc(db, collectionName, docId), value);
    } else if (value && typeof value === 'object') {
      const entries = Object.entries(value);
      await Promise.all(
        entries.map(([key, itemValue]) => setDoc(doc(db, collectionName, key), itemValue as any))
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function update(reference: DbReference, partialValue: Record<string, any>): Promise<void> {
  const { collectionName, docId, path } = reference;
  try {
    if (docId) {
      await setDoc(doc(db, collectionName, docId), partialValue, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function remove(reference: DbReference): Promise<void> {
  const { collectionName, docId, path } = reference;
  try {
    if (docId) {
      await deleteDoc(doc(db, collectionName, docId));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function push(reference: DbReference, value?: any): DbReference & { key: string } {
  const { collectionName } = reference;
  const generatedId = `${collectionName.slice(0, 4)}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
  const childRef: DbReference & { key: string } = {
    path: `${collectionName}/${generatedId}`,
    collectionName,
    docId: generatedId,
    key: generatedId,
  };
  if (value !== undefined) {
    set(childRef, { ...value, id: value.id || generatedId });
  }
  return childRef;
}

export async function getOnce(reference: DbReference): Promise<{ val: () => any; exists: () => boolean }> {
  const { collectionName, docId, path } = reference;
  try {
    if (docId) {
      const snap = await getDoc(doc(db, collectionName, docId));
      return {
        exists: () => snap.exists(),
        val: () => (snap.exists() ? snap.data() : null),
      };
    }
    const snap = await getDocs(collection(db, collectionName));
    const record: Record<string, any> = {};
    snap.forEach((d) => {
      record[d.id] = d.data();
    });
    const hasItems = Object.keys(record).length > 0;
    return {
      exists: () => hasItems,
      val: () => (hasItems ? record : null),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return { exists: () => false, val: () => null };
  }
}

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
};
