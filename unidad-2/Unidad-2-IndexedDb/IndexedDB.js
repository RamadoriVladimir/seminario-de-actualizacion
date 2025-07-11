class IndexedDB {
  #dbInstance = null;
  #dbName;
  #dbVersion;
  #storeName;

  constructor(dbName, dbVersion, storeName) {
    this.#dbName = dbName;
    this.#dbVersion = dbVersion;
    this.#storeName = storeName;
  }

  onDatabaseUpgrade(event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains(this.#storeName)) {
      const objectStore = db.createObjectStore(this.#storeName, { keyPath: "id", autoIncrement: true });
      objectStore.createIndex("nombre", "nombre", { unique: false });
      objectStore.createIndex("email", "email", { unique: true });
    }
  }

  onDatabaseConnectionSuccess(event) {
    this.#dbInstance = event.target.result;
  }

  onDatabaseConnectionError(event) {
    console.error(event.target.error);
  }

  onTransactionComplete() {}

  onTransactionError(event) {
    console.error(event.target.error);
  }

  onTransactionAbort() {}

  open() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB no está soportado en este navegador."));
        return;
      }

      const request = indexedDB.open(this.#dbName, this.#dbVersion);

      request.onupgradeneeded = this.onDatabaseUpgrade.bind(this);

      request.onsuccess = (event) => {
        this.onDatabaseConnectionSuccess(event);
        resolve(this.#dbInstance);
      };

      request.onerror = (event) => {
        this.onDatabaseConnectionError(event);
        reject(event.target.error);
      };
    });
  }

  close() {
    if (this.#dbInstance) {
      this.#dbInstance.close();
      this.#dbInstance = null;
    }
  }

  getDb() {
    if (!this.#dbInstance) {
      throw new Error("La base de datos no está inicializada. Llama a 'open()' primero.");
    }
    return this.#dbInstance;
  }

  createTransaction(mode) {
    const db = this.getDb();
    const transaction = db.transaction([this.#storeName], mode);
    transaction.oncomplete = this.onTransactionComplete.bind(this);
    transaction.onerror = this.onTransactionError.bind(this);
    transaction.onabort = this.onTransactionAbort.bind(this);
    return transaction;
  }

  add(data) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.createTransaction("readwrite");
        const objectStore = transaction.objectStore(this.#storeName);
        const request = objectStore.add(data);

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.createTransaction("readonly");
        const objectStore = transaction.objectStore(this.#storeName);
        const request = objectStore.get(key);

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  getAll() {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.createTransaction("readonly");
        const objectStore = transaction.objectStore(this.#storeName);
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  put(data) {
    return new Promise((resolve, reject) => {
      try {
        if (!data || data.id === undefined) {
          throw new Error("Los datos para 'put' deben incluir la clave primaria ('id').");
        }

        const transaction = this.createTransaction("readwrite");
        const objectStore = transaction.objectStore(this.#storeName);
        const request = objectStore.put(data);

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  delete(key) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.createTransaction("readwrite");
        const objectStore = transaction.objectStore(this.#storeName);
        const request = objectStore.delete(key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  clear() {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.createTransaction("readwrite");
        const objectStore = transaction.objectStore(this.#storeName);
        const request = objectStore.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }
}

export { IndexedDB };