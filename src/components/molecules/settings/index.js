import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LogoutIcon from 'material-ui/svg-icons/action/input';
import MenuItem from 'material-ui/MenuItem';
import { postLogoutURL } from '../../../constants';


const styles = {
  settings: {
    item: {
      cursor: 'pointer',
    },
  },
};


class Settings extends Component {
  handleLogout() {
    // eslint-disable-next-line no-undef
    window.localStorage.removeItem('MaterialUIStarter');
    this.context.router.push(postLogoutURL);
  }

  render() {
    return (
      <MenuItem
        primaryText="Logout"
        leftIcon={<LogoutIcon />}
        onTouchTap={this.handleLogout}
        style={styles.settings.item}
      />
    );
  }
}

Settings.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default Settings;
