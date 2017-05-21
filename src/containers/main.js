import React from 'react';
import PropTypes from 'prop-types';
import { Router, hashHistory } from 'react-router';
import { connect } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { StyleRoot } from 'radium';
import { requireAuth } from '../utils';
import Landing from '../pages/landing';
import Login from '../pages/login';
import NotFound from '../pages/not-found';
import Template from '../templates/default';
import App from './app';


const routes = {
  component: App,
  childRoutes: [
    {
      path: '/',
      component: Template,
      onEnter: requireAuth,
      childRoutes: [
      ],
    },
    {
      path: '/login',
      component: Login,
    },
    {
      path: '/landing',
      component: Landing,
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
    <StyleRoot>
      <MuiThemeProvider muiTheme={props.theme}>
        <Router history={hashHistory} routes={routes} />
      </MuiThemeProvider>
    </StyleRoot>
  );
}


Main.propTypes = {
  theme: PropTypes.object,
};


export default connect(mapStateToProps)(Main);
