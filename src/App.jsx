import React, { Component } from 'react';
import { Provider } from 'mobx-react';
import { ipcRenderer } from 'electron';
// import Router from './routes';
import getRoutes from './routes';
import { HashRouter } from 'react-router-dom';

import './global.css';
// import './assets/fonts/icomoo/style.css?inline';
// import '../public/fonts/icomoon/style.css?inline';
import './utils/albumcolors';
import stores from './stores';

class App extends Component {
  async componentWillMount() {
    if (window.navigator.onLine) {
      await stores.session.hasLogin();
      await stores.settings.init();
      await stores.search.getHistory();
    }
  }

  canisend() {
    return this.refs.navigator.history.location.pathname === '/' && stores.chat.user;
  }

  componentDidMount() {
    var navigator = this.refs.navigator;

    // Hide the tray icon
    ipcRenderer.on('hide-tray', () => {
      stores.settings.setShowOnTray(false);
    });
    // Chat with user
    ipcRenderer.on('message-chatto', (event, args) => {
      var user = stores.contacts.memberList.find(e => e.UserName === args.id);

      navigator.history.push('/');
      setTimeout(stores.chat.chatTo(user));
    });

    // Show the user info
    ipcRenderer.on('show-userinfo', (event, args) => {
      var user = stores.contacts.memberList.find(e => e.UserName === args.id);
      stores.userinfo.toggle(true, user);
    });

    // Shwo the settings page
    ipcRenderer.on('show-settings', () => {
      navigator.history.push('/settings');
    });

    // Show a modal to create a new conversation
    ipcRenderer.on('show-newchat', () => {
      navigator.history.push('/');
      stores.newchat.toggle(true);
    });

    // Show the conversation pane
    ipcRenderer.on('show-conversations', () => {
      if (this.canisend()) {
        stores.chat.toggleConversation();
      }
    });

    // Search in currently conversation list
    ipcRenderer.on('show-search', () => {
      navigator.history.push('/');
      stores.chat.toggleConversation(true);

      setTimeout(() => document.querySelector('#search').focus());
    });

    // Show the home page
    ipcRenderer.on('show-messages', () => {
      navigator.history.push('/');
      stores.chat.toggleConversation(true);
    });

    // Batch send message
    ipcRenderer.on('show-batchsend', () => {
      stores.batchsend.toggle(true);
    });

    // Insert the qq emoji
    ipcRenderer.on('show-emoji', () => {
      if (this.canisend()) {
        document.querySelector('#showEmoji').click();
      }
    });

    ipcRenderer.on('show-messageInput', () => {
      if (this.canisend()) {
        document.querySelector('#messageInput').focus();
      }
    });

    // Show contacts page
    ipcRenderer.on('show-contacts', () => {
      navigator.history.push('/contacts');
    });

    // Go to next conversation
    ipcRenderer.on('show-next', () => {
      navigator.history.push('/');
      stores.chat.toggleConversation(true);
      setTimeout(stores.chat.chatToNext);
    });

    // Go to the previous conversation
    ipcRenderer.on('show-previous', () => {
      navigator.history.push('/');
      stores.chat.toggleConversation(true);
      setTimeout(stores.chat.chatToPrev);
    });

    // When the system resume reconnet to WeChat
    ipcRenderer.on('os-resume', async () => {
      var session = stores.session;

      console.log('os-resume' + new Date());
      setTimeout(() => {
        session.checkTimeout(true);
      }, 3000);
    });

    // Show the daemon error
    ipcRenderer.on('show-errors', (event, args) => {
      stores.snackbar.showMessage(args.message);
    });
  }

  render() {
    // return (
    //   <div className="App">
    //     <Provider {...stores}>
    //       <Router />
    //     </Provider>
    //   </div>
    // );

    return (
      <Provider {...stores}>
        <HashRouter ref="navigator">{getRoutes()}</HashRouter>
      </Provider>
    );
  }
}

export default App;
