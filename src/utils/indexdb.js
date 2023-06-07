class IndexDB {
  db = null;
  indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  constructor(dbName, version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.initDB();
  }

  /**
   * 初始化数据库
   **/
  initDB() {
    this.db = this.indexedDB.open(this.dbName, this.version);
    this.db.onsuccess = event => {
      this.db = event.target.result;
      console.log('数据库打开成功');
    };
    this.db.onerror = () => {
      console.log('数据库打开报错');
    };
    this.createMessagesStore();
  }

  /**
   * 创建仓库
   **/
  createMessagesStore() {
    if (!this.db) {
      return;
    }
    this.db.onupgradeneeded = event => {
      event.target.result
        .createObjectStore('messages', { keyPath: 'CreateTime' })
        .createIndex('FromUserName', 'FromUserName', { unique: false });
      event.target.result
        .createObjectStore('contacts', { keyPath: 'UserName' })
        .createIndex('UserName', 'UserName', { unique: false });
      event.target.result
        .createObjectStore('member', { keyPath: 'UserName' })
        .createIndex('UserName', 'UserName', { unique: false });
    };
  }

  /**
   * 新增数据
   * @param {string} storeName 仓库名称
   * @param {string} data 数据
   * @param {string} key 主键
   * @return {object} 返回一个promise对象
   * @memberof IndexDB
   * @example
   * const db = new IndexDB('test');
   * db.add('messages', { name: '张三' }, '1').then(res => {
   *  console.log(res);
   *});
   *  // 成功返回：{ code: 0, msg: '添加成功' }
   *  // 失败返回：{ code: 1, msg: '添加失败' }
   *  // 失败返回：{ code: 4, msg: '数据库未打开' }
   **/
  add(storeName, data, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve({ code: 4, msg: '数据库未打开' });
        return;
      }
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.add(data, key);
      request.onsuccess = () => {
        resolve({ code: 0, msg: '添加成功' });
      };
      request.onerror = () => {
        resolve({ code: 1, msg: '添加失败' });
      };
    });
  }

  /**
   * 通过主键读取数据
   * @param {string} storeName 仓库名称
   * @param {string} key 主键值
   * @return {object} 返回一个promise对象
   * @memberof IndexDB
   * @example
   * const db = new IndexDB('test');
   * db.get('messages', '1').then(res => {
   * console.log(res);
   * // 成功返回：{ code: 0, msg: '获取成功', data: { name: '张三' } }
   * // 失败返回：{ code: 1, msg: '获取失败' }
   * // 失败返回：{ code: 4, msg: '数据库未打开' }
   * });
   **/
  get(storeName, key) {
    return new Promise(resolve => {
      if (!this.db) {
        resolve({ code: 4, msg: '数据库未打开' });
        return;
      }
      const transaction = this.db.transaction([storeName]);
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.get(key);
      request.onsuccess = event => {
        resolve({ code: 0, msg: '获取成功', data: event.target.result });
      };
      request.onerror = () => {
        resolve({ code: 1, msg: '获取失败' });
      };
    });
  }

  /**
   * 获取全部数据
   * @param {string} storeName 仓库名称
   * @return {object} 返回一个promise对象
   * @memberof IndexDB
   * @example
   * const db = new IndexDB('test');
   * db.getAll('messages').then(res => {
   * console.log(res);
   * // 成功返回：{ code: 0, msg: '获取成功', data: [{ name: '张三' }] }
   * // 失败返回：{ code: 1, msg: '获取失败' }
   * // 失败返回：{ code: 4, msg: '数据库未打开' }
   * });
   **/
  getAll(storeName) {
    return new Promise(resolve => {
      if (!this.db) {
        resolve({ code: 4, msg: '数据库未打开' });
        return;
      }
      const transaction = this.db.transaction([storeName]);
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.getAll();
      request.onsuccess = event => {
        resolve({ code: 0, msg: '获取成功', data: event.target.result });
      };
      request.onerror = () => {
        resolve({ code: 1, msg: '获取失败' });
      };
    });
  }

  /**
   * 通过索引读取数据
   * @param {string} storeName 仓库名称
   * @param {string} indexName 索引名称
   * @param {string} key 索引值
   * @return {object} 返回一个promise对象
   * @memberof IndexDB
   * @example
   * const db = new IndexDB('test');
   * db.getByIndex('messages', 'FromUserName', 'wxid_123456').then(res => {
   * console.log(res);
   * // 成功返回：{ code: 0, msg: '获取成功', data: { name: '张三' } }
   * // 失败返回：{ code: 1, msg: '获取失败' }
   * // 失败返回：{ code: 4, msg: '数据库未打开' }
   * });
   **/
  getByIndex(storeName, indexName, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve({ code: 4, msg: '数据库未打开' });
        return;
      }
      const transaction = this.db.transaction([storeName]);
      const objectStore = transaction.objectStore(storeName);
      const index = objectStore.index(indexName);
      const request = index.get(key);
      request.onsuccess = event => {
        resolve({ code: 0, msg: '获取成功', data: event.target.result });
      };
      request.onerror = () => {
        resolve({ code: 1, msg: '获取失败' });
      };
    });
  }

  /**
   * 通过索引读取分页数据
   * @param {string} storeName 仓库名称
   * @param {string} indexName 索引名称
   * @param {string} key 索引值
   * @param {number} page 页码
   * @param {number} size 每页条数
   * @return {object} 返回一个promise对象
   * @memberof IndexDB
   * @example
   * const db = new IndexDB('test');
   * db.getByIndexPage('messages', 'FromUserName', 'wxid_123456', 1, 10).then(res => {
   * console.log(res);
   * // 成功返回：{ code: 0, msg: '获取成功', data: [{ name: '张三' }] }
   * // 失败返回：{ code: 1, msg: '获取失败' }
   * // 失败返回：{ code: 4, msg: '数据库未打开' }
   * });
   **/
  getByIndexPage(storeName, indexName, key, page, size) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve({ code: 4, msg: '数据库未打开' });
        return;
      }
      const transaction = this.db.transaction([storeName]);
      const objectStore = transaction.objectStore(storeName);
      const index = objectStore.index(indexName);
      const request = index.openCursor(IDBKeyRange.only(key));
      const result = [];
      let i = 0;
      request.onsuccess = event => {
        const cursor = event.target.result;
        if (cursor) {
          if (i >= (page - 1) * size && i < page * size) {
            result.push(cursor.value);
          }
          i++;
          cursor.continue();
        } else {
          resolve({ code: 0, msg: '获取成功', data: result });
        }
      };
      request.onerror = () => {
        resolve({ code: 1, msg: '获取失败' });
      };
    });
  }

  /**
   * 更新数据
   * @param {string} storeName 仓库名称
   * @param {object} data 数据
   * @return {object} 返回一个promise对象
   * @memberof IndexDB
   * @example
   * const db = new IndexDB('test');
   * db.update('messages', { name: '张三' }).then(res => {
   * console.log(res);
   * // 成功返回：{ code: 0, msg: '更新成功' }
   * // 失败返回：{ code: 1, msg: '更新失败' }
   * // 失败返回：{ code: 4, msg: '数据库未打开' }
   * });
   **/
  update(storeName, data) {
    return new Promise(resolve => {
      if (!this.db) {
        resolve({ code: 4, msg: '数据库未打开' });
        return;
      }
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.put(data);
      request.onsuccess = () => {
        resolve({ code: 0, msg: '更新成功' });
      };
      request.onerror = () => {
        resolve({ code: 1, msg: '更新失败' });
      };
    });
  }

  /**
   * 通过主键删除数据
   * @param {string} storeName 仓库名称
   * @param {string} key 主键值
   * @return {object} 返回一个promise对象
   * @memberof IndexDB
   * @example
   * const db = new IndexDB('test');
   * db.delete('messages', '1').then(res => {
   * console.log(res);
   * // 成功返回：{ code: 0, msg: '删除成功' }
   * // 失败返回：{ code: 1, msg: '删除失败' }
   * // 失败返回：{ code: 4, msg: '数据库未打开' }
   * });
   **/
  delete(storeName, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve({ code: 4, msg: '数据库未打开' });
        return;
      }
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.delete(key);
      request.onsuccess = () => {
        resolve({ code: 0, msg: '删除成功' });
      };
      request.onerror = () => {
        resolve({ code: 1, msg: '删除失败' });
      };
    });
  }

  /**
   * 通过索引删除数据
   * @param {string} storeName 仓库名称
   * @param {string} indexName 索引名称
   * @param {string} key 索引值
   * @return {object} 返回一个promise对象
   * @memberof IndexDB
   * @example
   * const db = new IndexDB('test');
   * db.deleteByIndex('messages', 'FromUserName', 'wxid_123456').then(res => {
   * console.log(res);
   * // 成功返回：{ code: 0, msg: '删除成功' }
   * // 失败返回：{ code: 1, msg: '删除失败' }
   * // 失败返回：{ code: 4, msg: '数据库未打开' }
   * });
   **/
  deleteByIndex(storeName, indexName, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve({ code: 4, msg: '数据库未打开' });
        return;
      }
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const index = objectStore.index(indexName);
      const request = index.getKey(key);
      request.onsuccess = event => {
        objectStore.delete(event.target.result);
        resolve({ code: 0, msg: '删除成功' });
      };
      request.onerror = () => {
        resolve({ code: 1, msg: '删除失败' });
      };
    });
  }

  /**
   * 清空仓库
   * @param {string} storeName 仓库名称
   * @return {object} 返回一个promise对象
   * @memberof IndexDB
   * @example
   * const db = new IndexDB('test');
   * db.clear('messages').then(res => {
   * console.log(res);
   * // 成功返回：{ code: 0, msg: '清空成功' }
   * // 失败返回：{ code: 1, msg: '清空失败' }
   * // 失败返回：{ code: 4, msg: '数据库未打开' }
   * });
   **/
  clear(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve({ code: 4, msg: '数据库未打开' });
        return;
      }
      const transaction = this.db.transaction([storeName], 'readwrite');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.clear();
      request.onsuccess = () => {
        resolve({ code: 0, msg: '清空成功' });
      };
      request.onerror = () => {
        resolve({ code: 1, msg: '清空失败' });
      };
    });
  }

  /**
   * 关闭数据库
   * @memberof IndexDB
   * @example
   * const db = new IndexDB('test');
   * db.close();
   * // 关闭数据库
   * // 该函数没有返回值
   * });
   **/
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * 删除数据库
   * @param {string} dbName 数据库的名字
   * @return {object} 返回一个promise对象
   * @memberof IndexDB
   * @example
   * IndexDB.deleteDB('test').then(res => {
   * console.log(res);
   * // 成功返回：{ code: 0, msg: '删除成功' }
   * // 失败返回：{ code: 1, msg: '删除失败' }
   * });
   * // 删除数据库
   * // 该函数没有返回值
   * });
   **/
  static deleteDB(dbName) {
    return new Promise((resolve, reject) => {
      //  兼容浏览器
      const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      const request = indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => {
        resolve({ code: 0, msg: '删除成功' });
      };
      request.onerror = () => {
        resolve({ code: 1, msg: '删除失败' });
      };
    });
  }
}
export default IndexDB;
