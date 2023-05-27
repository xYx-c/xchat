import store from 'electron-store';
const storage = new store();

export default {
  get: key => {
    return storage.get(key);
    // return new Promise((resolve, reject) => {
    //   let value = storage.get(key);
    //   if (value) {
    //     resolve(value);
    //   } else {
    //     reject();
    //   }
    // });
  },

  set: (key, data) => {
    storage.set(key, data);
    // return new Promise((resolve, reject) => {
    //   storage.set(key, data, err => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(data);
    //     }
    //   });
    // });
  },

  remove: key => {
    return storage.delete(key);
    // return new Promise((resolve, reject) => {
    //   storage.remove(key, err => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve();
    //     }
    //   });
    // });
  },
  has: key => {
    return storage.has(key);
  },
};
