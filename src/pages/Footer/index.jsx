import React, { Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clazz from 'classnames';

import classes from './style.module.scss';
import Home from './Home';
import Contacts from './Contacts';
import Settings from './Settings';
import { Communication, MoreOne, Peoples } from '@icon-park/react';

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
              <Communication theme="filled" size="22" fill="#777"/>
            </span>
          </Link>

          <Link className="link" tabIndex="-1" to="/contacts">
            <span className={clazz({ [classes.active]: pathname === '/contacts' })}>
              <Peoples theme="filled" size="22" fill="#777"/>
            </span>
          </Link>

          <Link className="link" tabIndex="-1" to="/settings">
            <span className={clazz({ [classes.active]: pathname === '/settings' })}>
              <MoreOne theme="filled" size="24" fill="#777"/>
            </span>
          </Link>
        </nav>
        <div className={classes.right}>{React.createElement(component)}</div>
      </footer>
    );
  }
}
