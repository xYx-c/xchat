
import React, { Component } from 'react';
import { Modal, ModalBody } from 'components/Modal';
import { inject, observer } from 'mobx-react';

import classes from './style.css?inline';

@inject(stores => {
    var confirmImagePaste = stores.confirmImagePaste;

    return {
        show: confirmImagePaste.show,
        image: confirmImagePaste.image,

        ok: () => {
            console.log('ok');
            confirmImagePaste.ok();
            confirmImagePaste.toggle(false);
        },
        cancel: () => {
            console.log('cancel');
            confirmImagePaste.cancel();
            confirmImagePaste.toggle(false);
        },
    };
})
@observer
export default class ConfirmImagePaste extends Component {
    navigation(e) {
        // User press ESC
        if (e.keyCode === 81) {
            console.log(81);
            this.props.cancel();
        }
        if (e.keyCode === 13) {
            console.log(13);
            this.props.ok();
        }
    }

    render() {
        var { show, cancel, ok, image } = this.props;
        setTimeout(() => {
            document.querySelector('#imageInputHidden').focus();
        }, 1000);

        return (
            <Modal
                fullscreen={true}
                show={show}>
                <ModalBody className={classes.container}>
                    Send image ?

                    <img src={image} />

                    <div>
                        <input onKeyUp={e => this.navigation(e)} id="imageInputHidden" style={{'zIndex': '-1', 'position': 'absolute', 'top': '-20px'}} />
                        <button onClick={e => ok()}>Send</button>
                        <button onClick={e => cancel()}>Cancel</button>
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}
