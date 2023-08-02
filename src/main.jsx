import React from 'react';
import { Provider } from 'mobx-react';
import { HashRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import App from './App';
import stores from './stores';

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Provider {...stores}>
      <App />
    </Provider>
  </HashRouter>,
);

postMessage({ payload: 'removeLoading' }, '*');
