import React from 'react';
// import { withRouter, Route, Switch } from 'react-router-dom';

import { Layout, Settings, Contacts, Home } from './pages';
import { Switch, Route, withRouter } from 'react-router-dom';
// import { useRoutes } from 'react-router-dom';

// router v4
const Main = withRouter(props => <Layout {...props} />);
export default () => {
  return (
    <Main>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/contacts" component={Contacts} />
        <Route exact path="/settings" component={Settings} />
      </Switch>
    </Main>
  );
};

// react-router-dom v6
// const routes = [
//   {
//     element: <Layout> </Layout>,
//     children: [{ path: '/', element: <Home /> }],
//   },
//   { path: '/contacts', element: <Contacts /> },
//   { path: '/settings', element: <Settings /> },
// ];
// export default () => useRoutes(routes);
