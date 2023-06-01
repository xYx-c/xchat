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
    element: <Main />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/contacts',
        element: <Contacts />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
    ],
  },
];
export default () => useRoutes(routes);
