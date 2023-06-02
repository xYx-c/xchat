import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { ipcRenderer } from 'electron';
import Router from './routes';

import { useLocation, useNavigate } from 'react-router-dom';
import './global.css';
import './assets/fonts/icomoon/style.css';
import './utils/albumcolors';
import { useStores } from './hooks/useStore';

// class App extends Component {
//   navigator = createRef(null);
//   async componentWillMount() {
//     if (window.navigator.onLine) {
//       await stores.session.hasLogin();
//       await stores.settings.init();
//       await stores.search.getHistory();
//     }
//   }
//
//   canisend() {
//     return this.refs.navigator.history.location.pathname === '/' && stores.chat.user;
//   }
//
//   componentDidMount() {
//     var navigator = this.refs.navigator;
//     console.log(this);
//
//     // Hide the tray icon
//     ipcRenderer.on('hide-tray', () => {
//       stores.settings.setShowOnTray(false);
//     });
//     // Chat with user
//     ipcRenderer.on('message-chatto', (event, args) => {
//       var user = stores.contacts.memberList.find(e => e.UserName === args.id);
//
//       navigator.history.push('/');
//       setTimeout(stores.chat.chatTo(user));
//     });
//
//     // Show the user info
//     ipcRenderer.on('show-userinfo', (event, args) => {
//       var user = stores.contacts.memberList.find(e => e.UserName === args.id);
//       stores.userinfo.toggle(true, user);
//     });
//
//     // Shwo the settings page
//     ipcRenderer.on('show-settings', () => {
//       navigator.history.push('/settings');
//     });
//
//     // Show a modal to create a new conversation
//     ipcRenderer.on('show-newchat', () => {
//       navigator.history.push('/');
//       stores.newchat.toggle(true);
//     });
//
//     // Show the conversation pane
//     ipcRenderer.on('show-conversations', () => {
//       if (this.canisend()) {
//         stores.chat.toggleConversation();
//       }
//     });
//
//     // Search in currently conversation list
//     ipcRenderer.on('show-search', () => {
//       navigator.history.push('/');
//       stores.chat.toggleConversation(true);
//
//       setTimeout(() => document.querySelector('#search').focus());
//     });
//
//     // Show the home page
//     ipcRenderer.on('show-messages', () => {
//       navigator.history.push('/');
//       stores.chat.toggleConversation(true);
//     });
//
//     // Batch send message
//     ipcRenderer.on('show-batchsend', () => {
//       stores.batchsend.toggle(true);
//     });
//
//     // Insert the qq emoji
//     ipcRenderer.on('show-emoji', () => {
//       if (this.canisend()) {
//         document.querySelector('#showEmoji').click();
//       }
//     });
//
//     ipcRenderer.on('show-messageInput', () => {
//       if (this.canisend()) {
//         document.querySelector('#messageInput').focus();
//       }
//     });
//
//     // Show contacts page
//     ipcRenderer.on('show-contacts', () => {
//       navigator.history.push('/contacts');
//     });
//
//     // Go to next conversation
//     ipcRenderer.on('show-next', () => {
//       navigator.history.push('/');
//       stores.chat.toggleConversation(true);
//       setTimeout(stores.chat.chatToNext);
//     });
//
//     // Go to the previous conversation
//     ipcRenderer.on('show-previous', () => {
//       navigator.history.push('/');
//       stores.chat.toggleConversation(true);
//       setTimeout(stores.chat.chatToPrev);
//     });
//
//     // When the system resume reconnet to WeChat
//     ipcRenderer.on('os-resume', async () => {
//       var session = stores.session;
//
//       console.log('os-resume' + new Date());
//       setTimeout(() => {
//         session.checkTimeout(true);
//       }, 3000);
//     });
//
//     // Show the daemon error
//     ipcRenderer.on('show-errors', (event, args) => {
//       stores.snackbar.showMessage(args.message);
//     });
//   }
//
//   render() {
//     return (
//       <Provider {...stores}>
//         <Router ref="navigator" />
//       </Provider>
//     );
//   }
// }

const App = () => {
  const navigator = useNavigate();
  const canisend = () => useLocation().pathname === '/' && stores.chat.user;
  const stores = useStores();
  useEffect(() => {
    if (window.navigator.onLine) {
      stores.session.hasLogin();
      stores.settings.init();
      // stores.search.getHistory();
    }
  }, []);
  useEffect(() => {
    ipcRenderer.on('hide-tray', () => {
      stores.settings.setShowOnTray(false);
    });
    ipcRenderer.on('message-chatto', (event, args) => {
      const user = stores.contacts.memberList.find(e => e.UserName === args.id);
      navigator('/');
      setTimeout(stores.chat.chatTo(user));
    });
    ipcRenderer.on('show-userinfo', (event, args) => {
      const user = stores.contacts.memberList.find(e => e.UserName === args.id);
      stores.userinfo.toggle(true, user);
    });
    ipcRenderer.on('show-settings', () => {
      navigator('/settings');
    });
    ipcRenderer.on('show-newchat', () => {
      navigator('/');
      stores.newchat.toggle(true);
    });
    ipcRenderer.on('show-conversations', () => {
      if (canisend()) {
        stores.chat.toggleConversation();
      }
    });
    ipcRenderer.on('show-search', () => {
      navigator('/');
      stores.chat.toggleConversation(true);
      setTimeout(() => document.querySelector('#search').focus());
    });
    ipcRenderer.on('show-messages', () => {
      navigator('/');
      stores.chat.toggleConversation(true);
    });
    ipcRenderer.on('show-batchsend', () => {
      stores.batchsend.toggle(true);
    });
    ipcRenderer.on('show-emoji', () => {
      if (canisend()) {
        document.querySelector('#showEmoji').click();
      }
    });
    ipcRenderer.on('show-messageInput', () => {
      if (canisend()) {
        document.querySelector('#messageInput').focus();
      }
    });
    ipcRenderer.on('show-contacts', () => {
      navigator.current.history.push('/contacts');
    });
    ipcRenderer.on('show-next', () => {
      navigator('/');
      stores.chat.toggleConversation(true);
      setTimeout(stores.chat.chatToNext);
    });
    ipcRenderer.on('show-previous', () => {
      navigator.current.history.push('/');
      stores.chat.toggleConversation(true);
      setTimeout(stores.chat.chatToPrev);
    });

    ipcRenderer.on('os-resume', async () => {
      const session = stores.session;
      console.log('os-resume' + new Date());
      setTimeout(() => {
        session.checkTimeout(true);
      }, 3000);
    });
    ipcRenderer.on('show-errors', (event, args) => {
      stores.snackbar.showMessage(args.message);
    });
  }, []);
  return <Router />;
};

export default observer(App);
