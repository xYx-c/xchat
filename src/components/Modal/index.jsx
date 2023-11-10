import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition, Transition } from 'react-transition-group';
import clazz from 'classnames';

import './style.scss';
import TransitionPortal from '../TransitionPortal';
import { on, off } from 'utils/event';

class ModalBody extends Component {
  render() {
    return (
      <Transition timeout={500}>
        <div className={clazz('Modal-body', this.props.className)} style={this.props.style}>
          {this.props.children}
        </div>
      </Transition>
    );
  }
}

class ModalHeader extends Component {
  render() {
    return <div className={clazz('Modal-header', this.props.className)}>{this.props.children}</div>;
  }
}

class ModalFooter extends Component {
  render() {
    return <div className={clazz('Modal-footer', this.props.className)}>{this.props.children}</div>;
  }
}

class Modal extends Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    overlay: PropTypes.bool,
    onCancel: PropTypes.func,
    transition4overlay: PropTypes.string,
    transition4body: PropTypes.string,
  };

  static defaultProps = {
    overlay: true,
    transition4overlay: 'Modal-overlay',
    transition4body: 'Modal-body',
    onCancel: Function,
  };

  renderOverlay() {
    if (!this.props.show || !this.props.overlay) {
      return;
    }
    return <div className={clazz('Modal-overlay', this.props.className)} onClick={this.props.onCancel} />;
  }

  renderBody() {
    if (!this.props.show) {
      return;
    }
    return <div className={clazz('Modal-content', this.props.className)}>{this.props.children}</div>;
  }

  handleEscKey(e) {
    if (e.keyCode === 27 && this.props.show) {
      this.props.onCancel();
    }
  }

  componentWillUnmount() {
    off(document, 'keydown', this.handleEscKey);
  }

  componentDidMount() {
    this.handleEscKey = this.handleEscKey.bind(this);
    on(document, 'keydown', this.handleEscKey);
  }

  render() {
    if (!/MSIE\s8\.0/.test(window.navigator.userAgent)) {
      document.body.style.overflow = this.props.show ? 'hidden' : null;
    }

    return (
      <div className="Modal" ref="node">
        <CSSTransition classNames={this.props.transition4overlay} timeout={200} ref="overlay">
          {() => this.renderOverlay()}
        </CSSTransition>
        <TransitionPortal classNames={this.props.transition4body} timeout={200} ref="content">
          {() => this.renderBody()}
        </TransitionPortal>
      </div>
    );
  }
}

export { Modal, ModalBody, ModalHeader, ModalFooter };
