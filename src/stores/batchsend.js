import { observable, action, makeAutoObservable } from 'mobx';
import contacts from './contacts';
import { pinyin } from 'pinyin-pro';

class BatchSend {
  @observable show = false;
  @observable query = '';
  @observable filtered = [];

  constructor() {
    makeAutoObservable(this);
  }

  @action async toggle(show = !self.show) {
    self.show = show;

    if (show === false) {
      self.query = '';
      self.filtered.replace([]);
    }
  }

  @action search(text = '') {
    var list = contacts.memberList;

    self.query = text;

    if (text) {
      text = pinyin(text.toLocaleLowerCase(), {toneType:'none'});

      list = list.filter(e => {
        var res = pinyin(e.NickName, {toneType: 'none'}).toLowerCase().indexOf(text) > -1;

        if (e.RemarkName) {
          res = res || pinyin(e.RemarkName, {toneType:'none'}).toLowerCase().indexOf(text) > -1;
        }

        return res;
      });
      self.filtered.replace(list);

      return;
    }

    self.filtered.replace([]);
  }
}

const self = new BatchSend();
export default self;
