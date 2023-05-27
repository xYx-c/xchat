import React, { Component } from 'react';

import classes from './style.module.scss';

export default class Placeholder extends Component {
  render() {
    return (
      <div className={classes.settings}>
        <a className={classes.button} href="mailto:var.845541909@qq.com?Subject=WeWeChat%20Feedback" target="_blank">
          Send feedback
          <i className="icon-ion-ios-email-outline" />
        </a>

        <a className={classes.button} href="https://github.com/Riceneeder/weweChat" target="_blank">
          Fork on Github
          <i className="icon-ion-social-github" />
        </a>
      </div>
    );
  }
}
