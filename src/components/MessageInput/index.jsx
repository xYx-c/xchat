import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import clazz from 'classnames';
import { basename } from 'path';

import classes from './style.module.scss';
import Emoji from './Emoji';
import { Link,GrinningFace } from '@icon-park/react';

export default class MessageInput extends Component {
  static propTypes = {
    me: PropTypes.object,
    sendMessage: PropTypes.func.isRequired,
    showMessage: PropTypes.func.isRequired,
    user: PropTypes.array.isRequired,
    confirmSendImage: PropTypes.func.isRequired,
    process: PropTypes.func.isRequired,
  };

  static defaultProps = {
    me: {},
  };

  canisend() {
    var user = this.props.user;

    if (true && user.length === 1 && user.slice(-1).pop().UserName === this.props.me.UserName) {
      this.props.showMessage("Can't send messages to yourself.");
      return false;
    }

    return true;
  }

  async handleEnter(e) {
    e.preventDefault();
    const textarea = this.refs.input;
    textarea.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault(); // 阻止默认的 Enter 换行行为
      }
    });
    let message = textarea.value.trim();
    if (e.ctrlKey && e.code == 'Enter') {
      const cursorPosition = textarea.selectionStart;
      const newMessage = message.substring(0, cursorPosition) + '\n' + message.substring(cursorPosition);
      textarea.value = newMessage;
      // textarea.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
      textarea.scrollTop = textarea.scrollHeight;
      return;
    }
    var user = this.props.user;
    var batch = user.length > 1;
    if (false || !this.canisend() || !message || e.code !== 'Enter') return;
    // You can not send message to yourself
    Promise.all(
      user
        .filter(e => e.UserName !== this.props.me.UserName)
        .map(async e => {
          let res = await this.props.sendMessage(e, { content: message, type: 1 }, true);
          if (!res) {
            await this.props.showMessage(
              batch ? `Sending message to ${e.NickName} has failed!` : 'Failed to send message.',
            );
          }
          return true;
        }),
    );
    this.refs.input.value = '';
  }

  state = {
    showEmoji: false,
  };

  toggleEmoji(show = !this.state.showEmoji) {
    this.setState({ showEmoji: show });
  }

  writeEmoji(emoji) {
    var input = this.refs.input;

    input.value += `[${emoji}]`;
    input.focus();
  }

  async batchProcess(file) {
    var message;
    var batch = this.props.user.length > 1;
    var receiver = this.props.user.filter(e => e.UserName !== this.props.me.UserName);
    var showMessage = this.props.showMessage;

    if (this.canisend() === false) {
      return;
    }
    for (let user of receiver) {
      if (message) {
        await this.props
          .sendMessage(user, message, true)
          .catch(ex => showMessage(`Sending message to ${user.NickName} has failed!`));
        continue;
      }
      // Do not repeat upload file, forward the message to another user
      message = await this.props.process(file, user);
      if (message === false) {
        if (batch) {
          showMessage(`Send message to ${user.NickName} is failed!`);
          continue;
        }
        // In batch mode just show the failed message
        showMessage('Failed to send image.');
      }
    }
  }

  async handlePaste(e) {
    var args = ipcRenderer.sendSync('file-paste');
    if (args.hasImage && this.canisend()) {
      e.preventDefault();
      if ((await this.props.confirmSendImage(args.filename)) === false) {
        return;
      }
      let parts = [new Blob([new Uint8Array(args.raw)], { type: 'image/png' })];
      let file = new File(parts, basename(args.filename), {
        lastModified: new Date(),
        type: 'image/png',
      });
      Object.defineProperty(file, 'path', { value: args.filename });
      this.batchProcess(file);
    }
  }

  componentWillReceiveProps(nextProps) {
    var input = this.refs.input;

    // When user has changed clear the input
    if (
      true &&
      input &&
      input.value &&
      this.props.user.map(e => e.UserName).join() !== nextProps.user.map(e => e.UserName).join()
    ) {
      input.value = '';
    }
  }

  render() {
    var canisend = !!this.props.user.length;

    return (
      <div
        className={clazz(classes.container, this.props.className, {
          [classes.shouldSelectUser]: !canisend,
        })}
      >
        <div className={classes.tips}>You should choose a contact first.</div>

        <textarea
          id="messageInput"
          ref="input"
          placeholder="Type something to send..."
          spellCheck="false"
          rows={1}
          readOnly={!canisend}
          onPaste={e => this.handlePaste(e)}
          onKeyUp={e => this.handleEnter(e)}
        />

        <div className={classes.action}>
          <i id="showUploader" onClick={e => canisend && this.refs.uploader.click()}>
            <Link theme="outline" size="24" fill="#4a4a4a" />
          </i>

          <i id="showEmoji" onClick={e => canisend && this.toggleEmoji(true)}>
            <GrinningFace theme="outline" size="24" fill="#4a4a4a"/>
          </i>

          <input
            onChange={e => {
              this.batchProcess(e.target.files[0]);
              e.target.value = '';
            }}
            ref="uploader"
            style={{
              display: 'none',
            }}
            type="file"
          />

          <Emoji
            close={e => setTimeout(() => this.toggleEmoji(false), 100)}
            output={emoji => this.writeEmoji(emoji)}
            show={this.state.showEmoji}
          />
        </div>
      </div>
    );
  }
}
