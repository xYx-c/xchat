import React from 'react';
import { Layout, Settings, Contacts, Home } from './pages';
import { useRoutes, useLocation, useNavigate, useParams } from 'react-router-dom';

function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();
    props = { ...props, location, navigate, params };
    return <Component {...props} />;
  }
  return ComponentWithRouterProp;
}

const Main = withRouter(props => <Layout {...props} />);
const routes = [
  {
    path: '/',
    element: (
      <Main>
        <Home />
      </Main>
    ),
  },
  {
    path: '/contacts',
    Element: (
      <Main>
        <Contacts />
      </Main>
    ),
  },
  {
    path: '/settings',
    Element: (
      <Main>
        <Settings />
      </Main>
    ),
  },
];
export default () => useRoutes(routes);
