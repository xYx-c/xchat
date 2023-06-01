import { observable, action, makeAutoObservable } from 'mobx';
import { pinyin } from 'pinyin-pro';

import contacts from './contacts';
import storage from 'utils/storage';
import helper from 'utils/helper';

class Search {
  @observable history = [];
  @observable result = {
    query: '',
    friend: [],
    groups: [],
  };
  @observable searching = false;

  constructor() {
    makeAutoObservable(this);
  }

  @action filter(text = '') {
    var list = contacts.memberList;
    var groups = [];
    var friend = [];

    text = pinyin(text.toLocaleLowerCase());

    list = contacts.memberList.filter(e => {
      var res = pinyin(e.NickName).toLowerCase().indexOf(text) > -1;

      if (e.RemarkName) {
        res = res || pinyin(e.RemarkName).toLowerCase().indexOf(text) > -1;
      }

      return res;
    });

    list.map(e => {
      if (helper.isChatRoom(e.UserName)) {
        return groups.push(e);
      }

      friend.push(e);
    });

    if (text) {
      self.result = {
        query: text,
        friend,
        groups,
      };
    } else {
      self.result = {
        query: text,
        friend: [],
        groups: [],
      };
    }

    self.searching = true;
    return self.result;
  }

  @action clearHistory() {
    self.history = [];
    storage.remove('history', []);
  }

  @action async addHistory(user) {
    var list = [user, ...self.history.filter(e => e.UserName !== user.UserName)];

    storage.set('history', list);
    await self.getHistory();
  }

  @action reset() {
    self.result = {
      query: '',
      friend: [],
      groups: [],
    };
    self.toggle(false);
  }

  @action async getHistory() {
    let list = storage.get('history');
    let history = [];
    // if (list instanceof Array) {
      list.map(e => {
        let user = contacts.memberList.find(user => user.UserName === e.UserName);
        if (user) {
          history.push(user);
        }
      });
    // }

    storage.set('history', history);
    self.history.replace(history);

    return history;
  }

  @action toggle(searching = !self.searching) {
    self.searching = searching;
  }
}

const self = new Search();
export default self;
