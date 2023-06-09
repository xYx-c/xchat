import { observable, action, makeAutoObservable } from 'mobx';

class ConfirmImagePaste {
  @observable show = false;
  @observable image;

  ok;
  cancel;

  constructor() {
    makeAutoObservable(this);
  }

  @action toggle(show = self.show, image = self.image) {
    var promise = new Promise((resolve, reject) => {
      self.ok = () => resolve(true);
      self.cancel = () => resolve(false);
    });

    self.show = show;
    self.image = image;

    return promise;
  }
}

const self = new ConfirmImagePaste();
export default self;
