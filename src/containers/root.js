import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { StyleRoot } from 'radium';
import store from '../store';
import App from './app';


function Root(props) {
  return (
    <Provider store={store}>
      <StyleRoot>
        <MuiThemeProvider muiTheme={props.theme}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MuiThemeProvider>
      </StyleRoot>
    </Provider>
  );
}

Root.propTypes = {
  theme: PropTypes.object,
};


export default Root;
