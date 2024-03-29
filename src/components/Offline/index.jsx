import React, { Component } from 'react';
import PropTypes from 'prop-types';

import classes from './style.module.scss';
import helper from '@/utils/helper';

export default class Avatar extends Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    show: false,
  };

  render() {
    if (!this.props.show) return false;

    return (
      <div className={classes.container} {...this.props}>
        <div>
          <img className="disabledDrag" src={helper.getImageUrl("offline.png")} />

          <h1>Oops, seems like you are offline!</h1>

          <button onClick={e => window.location.reload()}>Reload</button>
        </div>
      </div>
    );
  }
}
