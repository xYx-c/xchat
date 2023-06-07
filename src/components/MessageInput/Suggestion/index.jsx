import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clazz from 'classname';

import './style.global.scss';
import TransitionPortal from 'components/TransitionPortal';

export default class Suggestion extends Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    list: PropTypes.array.isRequired,
  };

  renderContent() {
    var { show, list, selected } = this.props;

    if (!show) {
      return false;
    }

    console.log(window.event);

    return (
      <div className="Suggestion">
        {list.map((e, index) => {
          return (
            <div
              key={index}
              className={clazz('Suggestion-item', {
                'Suggestion--selected': e.UserName === selected,
              })}
            >
              <img src={e.HeadImgUrl} />

              <div className="Suggestion-user">
                <p className="Suggestion-username" dangerouslySetInnerHTML={{ __html: e.RemarkName || e.NickName }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return (
      <TransitionPortal timeout={{enter: 0, exit: 150}} classNames="Suggestion">
        {this.renderContent()}
      </TransitionPortal>
    );
  }
}
