import React from 'react';
import { Provider } from 'mobx-react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import App from './App';
import stores from './stores';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider {...stores}>
      <App />
    </Provider>
  </BrowserRouter>,
);

postMessage({ payload: 'removeLoading' }, '*');
