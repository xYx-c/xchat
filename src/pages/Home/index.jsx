import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import clazz from 'classnames';

import classes from './style.module.scss';
import Loader from 'components/Loader';
import SearchBar from './SearchBar';
import Chats from './Chats';
import ChatContent from './ChatContent';
import { useStores } from '@/hooks/useStore';

const Home = () => {
  const stores = useStores();
  const loading = stores.session.loading;
  const showConversation = stores.chat.showConversation;
  const toggleConversation = stores.chat.toggleConversation;
  const showRedIcon = stores.settings.showRedIcon;
  const newChat = () => stores.newchat.toggle(true);
  useEffect(() => {
    toggleConversation(true);
  }, []);
  return (
    <div className={classes.container}>
      <Loader fullscreen={true} show={loading} />
      <div
        className={clazz(classes.inner, {
          [classes.hideConversation]: !showConversation,
        })}
      >
        <div className={classes.left}>
          <SearchBar />
          <Chats />

          {showRedIcon && (
            <div className={classes.addChat} onClick={() => newChat()}>
              <i className="icon-ion-android-add" />
            </div>
          )}
        </div>

        <div className={classes.right}>
          <ChatContent />
        </div>
      </div>
    </div>
  );
};
export default observer(Home);
