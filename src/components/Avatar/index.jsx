
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './style.global.scss';
import helper from '@/utils/helper';

export default class Avatar extends Component {
    static propTypes = {
        src: PropTypes.string,
        fallback: PropTypes.string,
    };

    static defaultProps = {
        fallback: helper.getImageUrl('user-fallback.png'),
    };

    handleError(e) {
        e.target.src = this.props.fallback;
    }

    handleLoad(e) {
        e.target.classList.remove('fadein');
    }

    render() {
        if (!this.props.src) return false;

        return (
            <img
                className={`Avatar fade fadein ${this.props.className}`}
                onClick={this.props.onClick}
                onLoad={e => this.handleLoad(e)}
                // onError={e => this.handleError(e)}
                src={this.props.src}
            />
        );
    }
}
