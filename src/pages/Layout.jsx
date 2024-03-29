import React, { Component, useState, useEffect, useRef } from 'react';
import { observer, inject } from 'mobx-react';
import { ipcRenderer } from 'electron';
import { Menu, getCurrentWindow } from '@electron/remote';

import classes from './Layout.module.scss';
import Footer from './Footer';
import Login from './Login';
import UserInfo from './UserInfo';
import AddFriend from './AddFriend';
import NewChat from './NewChat';
import Members from './Members';
import AddMember from './AddMember';
import BatchSend from './BatchSend';
import Forward from './Forward';
import ConfirmImagePaste from './ConfirmImagePaste';
import Loader from 'components/Loader';
import Snackbar from 'components/Snackbar';
import Offline from 'components/Offline';
import { Outlet, useLocation } from 'react-router-dom';
import { useStores } from '@/hooks/useStore';
import helper from '@/utils/helper';
import { UploadOne } from '@icon-park/react';

const Layout = () => {
  const stores = useStores();
  const isLogin = () => !!stores.session.auth;
  const loading = stores.session.loading;
  const message = stores.snackbar.text;
  const show = stores.snackbar.show;
  const process = stores.chat.process;
  const reconnect = stores.session.checkTimeout;
  const close = () => stores.snackbar.toggle(false);
  const canidrag = () => !!stores.chat.user && !stores.batchsend.show;

  const viewport = useRef();
  const footer = useRef();
  const holder = useRef();
  
  const location = useLocation();

  const [offline, setOffline] = useState(false);
  
  let templates = [
    { label: 'Undo', role: 'undo' },
    { label: 'Redo', role: 'redo' },
    { type: 'separator' },
    { label: 'Cut', role: 'cut' },
    { label: 'Copy', role: 'copy' },
    { label: 'Paste', role: 'paste' },
    { type: 'separator' },
    { label: 'Select all', role: 'selectall' },
  ];
  let menu = new Menu.buildFromTemplate(templates);
  // var canidrag = prop.canidrag;

  const initEvent = () => {
    document.body.addEventListener('contextmenu', e => {
      e.preventDefault();
      let node = e.target;
      while (node) {
        if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
          menu.popup(getCurrentWindow());
          break;
        }
        node = node.parentNode;
      }
    });

    window.addEventListener('offline', () => setOffline(true));

    window.addEventListener('online', () => {
      // Reconnect to wechat
      reconnect();
      setOffline(false);
    });

    if (window.process.platform === 'win32') {
      document.body.classList.add('isWin');
    }

    window.ondragover = e => {
      if (canidrag()) {
        holder.current.classList.add(classes.show);
        viewport.current.classList.add(classes.blur);
      }
      // If not st as 'copy', electron will open the drop file
      e.dataTransfer.dropEffect = 'copy';
      return false;
    };

    window.ondragleave = () => {
      if (!canidrag()) return false;
      holder.current.classList.remove(classes.show);
      viewport.current.classList.remove(classes.blur);
    };

    window.ondragend = e => false;

    window.ondrop = e => {
      var files = e.dataTransfer.files;
      e.preventDefault();
      e.stopPropagation();

      if (files.length && canidrag()) {
        Array.from(files).map(e => process(e));
      }

      holder.current.classList.remove(classes.show);
      viewport.current.classList.remove(classes.blur);
      return false;
    };
  };

  useEffect(() => {
    initEvent();
  }, []);

  if (!window.navigator.onLine) {
    return <Offline show={true} style={{ top: 0, paddingTop: 30 }} />;
  }

  if (!isLogin()) { return <Login />; }

  ipcRenderer.send('logined');

  return (
    <>
      <Snackbar close={close} show={show} text={message} />
      {/* <Loader show={loading} /> */}
      <div className={classes.container} ref={viewport}>
        <Outlet />
      </div>
      <Footer location={location} ref={footer} />
      <UserInfo />
      <AddFriend />
      <NewChat />
      <Members />
      <BatchSend />
      <AddMember />
      <ConfirmImagePaste />
      <Forward />
      <Offline show={offline} />
      <div className={classes.dragDropHolder} ref={holder}>
        <div className={classes.inner}>
          <div>
            <img src={helper.getImageUrl('filetypes/image.png')} />
            <img src={helper.getImageUrl('filetypes/word.png')} />
            <img src={helper.getImageUrl('filetypes/pdf.png')} />
            <img src={helper.getImageUrl('filetypes/archive.png')} />
            <img src={helper.getImageUrl('filetypes/video.png')} />
            <img src={helper.getImageUrl('filetypes/audio.png')} />
          </div>
          <UploadOne theme="outline" size="24" fill="#999"/>
          <h2>Drop your file here</h2>
        </div>
      </div>
    </>
  );
};

export default observer(Layout);
