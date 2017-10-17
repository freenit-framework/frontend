import React from 'react';
import PropTypes from 'prop-types';
import LogoutIcon from 'material-ui/svg-icons/action/input';
import MenuItem from 'material-ui/MenuItem';
import { isLoggedIn } from '../../../utils';
import { postLogoutURL } from '../../../constants';


const styles = {
  settings: {
    item: {
      cursor: 'pointer',
    },
  },
};


class Settings extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.handleLogout = () => {
      window.localStorage.removeItem('auth');
      this.context.router.history.push(postLogoutURL);
    };

    this.handleLogin = () => {
      this.context.router.history.push('/login');
    };
  }

  render() {
    const content = isLoggedIn() 
                  ? (
                    <MenuItem
                      primaryText="Logout"
                      leftIcon={<LogoutIcon />}
                      onTouchTap={this.handleLogout}
                      style={styles.settings.item}
                    />
                  ) : (
                    <MenuItem
                      primaryText="Login"
                      leftIcon={<LogoutIcon />}
                      onTouchTap={this.handleLogin}
                      style={styles.settings.item}
                    />
                  );
    return content;
  }
}

export default Settings;
