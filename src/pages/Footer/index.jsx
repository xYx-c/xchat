import React, { Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clazz from 'classnames';

import classes from './style.module.scss';
import Home from './Home';
import Contacts from './Contacts';
import Settings from './Settings';

export default class Footer extends Component {
  render() {
    let pathname = this.props.location.pathname;
    let component = {
      '/': Home,
      '/contacts': Contacts,
      '/settings': Settings,
    }[pathname];
    // 路由跳转

    return (
      <footer className={classes.footer}>
        <div></div>
        <nav>
          <Link className="link" tabIndex="-1" to="/">
            <span className={clazz({ [classes.active]: pathname === '/' })}>
              <i className="icon-ion-android-chat" />
            </span>
          </Link>

          <Link className="link" tabIndex="-1" to="/contacts">
            <span className={clazz({ [classes.active]: pathname === '/contacts' })}>
              <i className="icon-ion-ios-people" />
            </span>
          </Link>

          <Link className="link" tabIndex="-1" to="/settings">
            <span className={clazz({ [classes.active]: pathname === '/settings' })}>
              <i className="icon-ion-android-more-vertical" />
            </span>
          </Link>
        </nav>
        <div className={classes.right}>{React.createElement(component)}</div>
      </footer>
    );
  }
}
