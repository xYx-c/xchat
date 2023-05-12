
import { observable, action } from 'mobx';
import axios from 'axios';

import session from './session';
import helper from 'utils/helper';
import storage from 'utils/storage';

class UserInfo {
    @observable show = false;
    @observable remove = false;
    @observable user = {};
    @observable pallet = [];

    @action async toggle(show = self.show, user = self.user, remove = false) {
        if (user.UserName === session.user.User.UserName) {
            remove = false;
        }

        self.remove = remove;
        self.show = show;
        self.user = user;

        // Try to get from cache
        var pallet = user.pallet;

        if (show) {
            if (pallet) {
                self.pallet = user.pallet;
            } else {
                pallet = await helper.getPallet(user.HeadImgUrl);

                // Cache the pallet
                self.user.pallet = pallet;
                self.pallet = pallet;
            }
        }
    }

    @action updateUser(user) {
        self.user = user;
    }

    @action async setRemarkName(name, id) {
        var auth = await storage.get('auth');
        var response = await axios.post('/cgi-bin/mmwebwx-bin/webwxoplog', {
            BaseRequest: {
                Sid: auth.wxsid,
                Uin: auth.wxuin,
                Skey: auth.skey,
            },
            CmdId: 2,
            RemarkName: name.trim(),
            UserName: id,
        });

        return +response.data.BaseResponse.Ret === 0;
    }

    @action async removeMember(roomId, userid) {
        var auth = await storage.get('auth');
        var response = await axios.post('/cgi-bin/mmwebwx-bin/webwxupdatechatroom?fun=delmember', {
            BaseRequest: {
                Sid: auth.wxsid,
                Uin: auth.wxuin,
                Skey: auth.skey,
            },
            ChatRoomName: roomId,
            DelMemberList: userid,
        });

        return +response.data.BaseResponse.Ret === 0;
    }
}

const self = new UserInfo();
export default self;
