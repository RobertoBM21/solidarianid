export const DB_NAME = 'solidarianidPwa';
export const DB_VERSION = 1;
export const MY_COLLABORATIONS_STORE = 'myCollaborations';
export const PENDING_ACTIONS_STORE = 'pendingActions';

function toIndexedDbError(error: DOMException | null): Error {
  return error ?? new Error('IndexedDB error');
}

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(MY_COLLABORATIONS_STORE)) {
        db.createObjectStore(MY_COLLABORATIONS_STORE, { keyPath: 'cacheKey' });
      }

      if (!db.objectStoreNames.contains(PENDING_ACTIONS_STORE)) {
        db.createObjectStore(PENDING_ACTIONS_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(toIndexedDbError(request.error));
    };
  });
}

export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as T[]);
    };

    request.onerror = () => {
      reject(toIndexedDbError(request.error));
    };
  });
}

export async function put(storeName: string, value: unknown): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(value);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(toIndexedDbError(request.error));
    };
  });
}

export async function add(
  storeName: string,
  value: unknown,
): Promise<IDBValidKey | undefined> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(value);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(toIndexedDbError(request.error));
    };
  });
}

export async function remove(
  storeName: string,
  id: IDBValidKey,
): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(toIndexedDbError(request.error));
    };
  });
}

export async function clear(storeName: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(toIndexedDbError(request.error));
    };
  });
}
