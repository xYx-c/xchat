import React from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';

const TransitionPortal = props => {
    return ReactDOM.createPortal(<CSSTransition {...props}>{props.children}</CSSTransition>, document.body);
}

export default TransitionPortal;
