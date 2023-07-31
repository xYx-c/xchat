import React, { Component } from 'react';

import classes from './style.module.scss';

export default class Placeholder extends Component {
  render() {
    return (
      <div className={classes.settings}>
        <a className={classes.button} href="mailto:var.xYx.c@outlook.com?Subject=xChat%20Feedback" target="_blank">
          Send feedback
          <i className="icon-ion-ios-email-outline" />
        </a>

        <a className={classes.button} href="https://github.com/xYx-c/xchat" target="_blank">
          Fork on Github
          <i className="icon-ion-social-github" />
        </a>
      </div>
    );
  }
}
