import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './style.global.scss';
import TransitionPortal from '../TransitionPortal';

export default class Snackbar extends Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
  };

  renderContent() {
    if (!this.props.show) {
      return false;
    }

    return (
      <div className="Snackbar">
        <div className="Snackbar-text" dangerouslySetInnerHTML={{ __html: this.props.text }} />
        <div className="Snackbar-action" onClick={() => this.props.close()}>
          DONE
        </div>
      </div>
    );
  }

  render() {
    return (
      <TransitionPortal timeout={{ enter: 0, exit: 150 }} classNames="Snackbar">
        {() => this.renderContent()}
      </TransitionPortal>
    );
  }
}
