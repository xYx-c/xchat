import { observable, action, makeAutoObservable } from 'mobx';
import axios from 'axios';
import contacts from './contacts';
import session from './session';
import storage from 'utils/storage';
import helper from 'utils/helper';
import { pinyin } from 'pinyin-pro';

class AddMember {
  @observable show = false;
  @observable query = '';
  @observable list = [];

  constructor() {
    makeAutoObservable(this);
  }
  @action toggle(show = !self.show) {
    self.show = show;
  }

  @action search(text) {
    text = pinyin(text.toLocaleLowerCase(), {toneType: 'none'});

    var list = contacts.memberList.filter(e => {
      var res = pinyin(e.NickName, {toneType: 'none'}).toLowerCase().indexOf(text) > -1;

      if (
        e.UserName === session.user.User.UserName ||
        !helper.isContact(e) ||
        helper.isChatRoom(e.UserName) ||
        helper.isFileHelper(e)
      ) {
        return false;
      }

      if (e.RemarkName) {
        res = res || pinyin(e.RemarkName, {toneType:'none'}).toLowerCase().indexOf(text) > -1;
      }

      return res;
    });

    self.query = text;
    self.list.replace(list);
  }

  @action reset() {
    self.query = '';
    self.list.replace([]);
  }

  @action async addMember(roomId, userids) {
    var auth = await storage.get('auth');
    var response = await axios.post('/cgi-bin/mmwebwx-bin/webwxupdatechatroom?fun=addmember', {
      BaseRequest: {
        Sid: auth.wxsid,
        Uin: auth.wxuin,
        Skey: auth.skey,
      },
      ChatRoomName: roomId,
      AddMemberList: userids.join(','),
    });

    return +response.data.BaseResponse.Ret === 0;
  }
}

const self = new AddMember();
export default self;
