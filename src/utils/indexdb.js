// Description: IndexedDB helper functions
class IndexdDb {
  constructor(dbName, upgradeCallback, version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.upgradeCallback = upgradeCallback;
  }

  static upgradeCallback = event => {
    let db = event.target.result;
    let objectStore = db.createObjectStore('sessions', { keyPath: 'UserName' });
    objectStore.createIndex('UserName', 'UserName', { unique: true });

    objectStore = db.createObjectStore('members', { keyPath: 'UserName' });
    objectStore.createIndex('UserName', 'UserName', { unique: true });

    objectStore = db.createObjectStore('messages', { keyPath: 'CreateTime' });
    objectStore.createIndex('FromUserName', 'FromUserName', { unique: false });
    objectStore.createIndex('ToUserName', 'ToUserName', { unique: false });
  };

  open = async () => {
    // 打开数据库，初始化store
    return await new Promise((resolve, reject) => {
      let request = indexedDB.open(this.dbName, this.version);
      request.onerror = event => {
        reject(event);
      };
      request.onsuccess = event => {
        this.db = event.target.result;
        resolve(event);
      };
      request.onupgradeneeded = event => {
        this.upgradeCallback(event);
      };
    });
  };
  add = (storeName, data) => {
    // 添加数据
    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction(storeName, 'readwrite');
      let store = transaction.objectStore(storeName);
      let request = store.add(data);
      request.onerror = event => {
        reject(event);
      };
      request.onsuccess = event => {
        resolve(event);
      };
    });
  };
  edit = (storeName, data) => {
    // 修改数据
    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction(storeName, 'readwrite');
      let store = transaction.objectStore(storeName);
      let request = store.put(data);
      request.onerror = event => {
        reject(event);
      };
      request.onsuccess = event => {
        resolve(event);
      };
    });
  };

  save = (storeName, data) => {
    // 保存数据
    // 如果数据存在则修改，否则添加
    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction(storeName, 'readwrite');
      let store = transaction.objectStore(storeName);
      // 新增数据
      let request = store.add(data);
      request.onerror = event => {
        // 如果数据已经存在，则修改
        if (event.target.error.name === 'ConstraintError') {
          let transaction = this.db.transaction(storeName, 'readwrite');
          let store = transaction.objectStore(storeName);
          let request = store.put(data);
          request.onerror = event => {
            reject(event);
          };
          request.onsuccess = event => {
            resolve(event);
          };
        }
      };
      request.onsuccess = event => {
        resolve(event);
      };
    });
  };

  get = (storeName, key) => {
    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction(storeName, 'readonly');
      let store = transaction.objectStore(storeName);
      let request = store.get(key);
      request.onerror = event => {
        reject(event);
      };
      request.onsuccess = event => {
        resolve(event.target.result);
      };
    });
  };
  getAll = storeName => {
    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction(storeName, 'readonly');
      let store = transaction.objectStore(storeName);
      let request = store.getAll();
      request.onerror = event => {
        reject(event);
      };
      request.onsuccess = event => {
        resolve(event.target.result);
      };
    });
  };

  getAllByIndex = (storeName, index, value) => {
    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction(storeName, 'readonly');
      let store = transaction.objectStore(storeName);
      let request = store.index(index).getAll(value);
      request.onerror = event => {
        reject(event);
      };
      request.onsuccess = event => {
        resolve(event.target.result);
      };
    });
  };

  page = (storeName, index, page, size) => {
    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction(storeName, 'readonly');
      let store = transaction.objectStore(storeName);
      let request = store.index(index).openCursor(null, 'prev');
      let result = [];
      let i = 0;
      request.onerror = event => {
        reject(event);
      };
      request.onsuccess = event => {
        let cursor = event.target.result;
        if (cursor) {
          if (i >= (page - 1) * size && i < page * size) {
            result.push(cursor.value);
          }
        }
        resolve(result);
      };
    });
  };
  delete = (storeName, key) => {
    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction(storeName, 'readwrite');
      let store = transaction.objectStore(storeName);
      let request = store.delete(key);
      request.onerror = event => {
        reject(event);
      };
      request.onsuccess = event => {
        resolve(event);
      };
    });
  };
  close = () => this.db.close();
}

export default async function(dbName, upgradeCallback = IndexdDb.upgradeCallback, version = 1) {
  const db = new IndexdDb(dbName, upgradeCallback, version);
  await db.open();
  return db;
}
