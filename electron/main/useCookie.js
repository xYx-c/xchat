import { app, session } from 'electron';

/**
 * electron15 后，跨域cookie无法携带，
 * 以下为解决办法
 */
function useCookie() {
  app.whenReady().then(() => {
    const filter = { urls: ['https://*/*'] };
    session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
      if (details.responseHeaders && details.responseHeaders['Set-Cookie']) {
        for (let i = 0; i < details.responseHeaders['Set-Cookie'].length; i++) {
          details.responseHeaders['Set-Cookie'][i] += ';SameSite=None;Secure';
        }
      }
      callback({ responseHeaders: details.responseHeaders });
    });
  });
}

export default useCookie;
