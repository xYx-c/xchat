import { observable, action, makeAutoObservable } from 'mobx';

class Snackbar {
  @observable show = false;
  @observable text = '';

  timer;

  constructor() {
    makeAutoObservable(this);
  }

  @action toggle(show = self.show, text = self.text) {
    self.show = show;
    self.text = text;

    if (show) {
      clearTimeout(self.timer);
      self.timer = setTimeout(() => {
        self.toggle(false);
      }, 3000);
    } else {
      clearTimeout(self.timer);
    }
  }

  @action showMessage(text = '') {
    self.toggle(true, text);
  }
}

const self = new Snackbar();
export default self;
