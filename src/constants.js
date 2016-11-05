import { hashHistory } from 'react-router';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';


export const history = hashHistory;
export const postLogoutURL = '/landing';


export const errors = {
  login: {
    UNAUTHORIZED: 'Unable to log you in. Wrong email or password',
  },
};


export const themes = {
  light: getMuiTheme({
    name: 'light',
    footer: {
      height: 25,
      textAlign: 'center',
      color: '#bbb',
      fontFamily: 'Roboto, sans-serif',
      boxShadow: '0px -1px 3px #eee',
      backgroundColor: 'white',
      a: {
        color: 'gray',
      },
    },

    inactive: {
      color: 'gray',
    },

    breadcrumbs: {
      height: 25,
      backgroundColor: 'rgba(166, 234, 255, 0.20)',
    },

    content: {
      padding: 10,
      backgroundColor: 'white',
    },
  }),

  dark: getMuiTheme({
    ...darkBaseTheme,
    name: 'dark',
    footer: {
      height: 25,
      textAlign: 'center',
      color: '#bbb',
      fontFamily: 'Roboto, sans-serif',
      boxShadow: '0px -1px 3px #282828',
      backgroundColor: '#303030',
      a: {
        color: 'gray',
      },
    },

    inactive: {
      color: 'gray',
    },

    breadcrumbs: {
      height: 25,
      backgroundColor: 'rgb(48, 55, 58)',
    },

    content: {
      padding: 10,
      backgroundColor: '#303030',
    },
  }),
};
