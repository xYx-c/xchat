import { observable, action, makeAutoObservable } from 'mobx';
import axios from 'axios';
import { pinyin } from 'pinyin-pro';

import contacts from './contacts';
import storage from 'utils/storage';
import helper from 'utils/helper';

class NewChat {
  @observable show = false;
  @observable query = '';
  @observable list = [];

  constructor() {
    makeAutoObservable(this);
  }

  @action toggle(show = !self.show) {
    console.log('toggle newchat');
    self.show = show;
  }

  @action search(text) {
    text = pinyin(text.toLocaleLowerCase(), {toneType: 'none'});
    var list = contacts.memberList.filter(e => {
      var res = pinyin(e.NickName, {toneType: 'none'}).toLowerCase().indexOf(text) > -1;

      if (e.RemarkName) {
        res = res || pinyin.letter(e.RemarkName).toLowerCase().indexOf(text) > -1;
      }

      return helper.isContact(e) && res;
    });

    self.query = text;
    self.list.replace(list);
  }

  @action reset() {
    self.query = '';
    self.list.replace([]);
  }

  @action async createChatRoom(userids) {
    var auth = await storage.get('auth');
    var response = await axios.post(`/cgi-bin/mmwebwx-bin/webwxcreatechatroom?r=${+new Date()}`, {
      BaseRequest: {
        Sid: auth.wxsid,
        Uin: auth.wxuin,
        Skey: auth.skey,
      },
      MemberCount: userids.length,
      MemberList: userids.map(e => ({ UserName: e })),
    });

    if (+response.data.BaseResponse.Ret === 0) {
      // Load the new contact infomation
      let user = await contacts.getUser(response.data.ChatRoomName);
      return user;
    }

    return false;
  }
}

const self = new NewChat();
export default self;
