import React from 'react';
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


const Settings = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired,
  },

  handleLogout() {
    // eslint-disable-next-line no-undef
    window.localStorage.removeItem('MaterialUIStarter');
    this.context.router.push(postLogoutURL);
  },

  render() {
    return (
      <MenuItem
        primaryText="Logout"
        leftIcon={<LogoutIcon />}
        onTouchTap={this.handleLogout}
        style={styles.settings.item}
      />
    );
  },
});


export default Settings;
