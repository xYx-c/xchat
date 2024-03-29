import { observable, action, makeAutoObservable } from 'mobx';
import contacts from './contacts';
import session from './session';
import chat from './chat';
import { pinyin } from 'pinyin-pro';

class Forward {
  @observable show = false;
  @observable message = {};
  @observable list = [];
  @observable query = '';

  constructor() {
    makeAutoObservable(this);
  }

  @action async toggle(show = self.show, message = {}) {
    self.show = show;
    self.message = message;

    if (show === false) {
      self.query = '';
      self.list.replace([]);
    }
  }

  @action search(text = '') {
    var list;

    self.query = text;

    if (text) {
      list = contacts.memberList.filter(e => {
        if (e.UserName === session.user.User.UserName) {
          return false;
        }

        return (
          pinyin(e.NickName, { toneType: 'none' })
            .toLowerCase()
            .indexOf(pinyin(text.toLocaleLowerCase(), { toneType: 'none' })) > -1
        );
      });
      self.list.replace(list);

      return;
    }

    self.list.replace([]);
  }

  @action async send(userid) {
    var message = self.message;
    var user = await contacts.getUser(userid);

    message = Object.assign(message, {
      content: message.Content,
      type: message.MsgType,
    });

    chat.sendMessage(user, message, true);
  }
}

const self = new Forward();
export default self;
