import React from 'react';
import { Router } from 'react-router';
import { connect } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { history } from '../constants';
import Layout from '../components/layouts/layout';
import NotFound from '../pages/not-found';
import Login from '../pages/login';
import Register from '../pages/register';
import Landing from '../pages/landing';
import Home from '../pages/home';
import App from './app';
import '../reset.css';


const routes = {
  component: App,
  childRoutes: [
    {
      path: '/',
      component: Layout,
      childRoutes: [
        Home,
      ],
    },
    {
      path: '/landing',
      component: Landing,
    },
    {
      path: '/login',
      component: Login,
    },
    {
      path: '/register',
      component: Register,
    },
    {
      path: '*',
      component: NotFound,
    },
  ],
};


const mapStateToProps = (state) => ({
  theme: state.theme.theme,
});


function Main(props) {
  return (
    <MuiThemeProvider muiTheme={props.theme}>
      <Router history={history} routes={routes} />
    </MuiThemeProvider>
  );
}


Main.propTypes = {
  theme: React.PropTypes.object.isRequired,
};


export default connect(mapStateToProps)(Main);
