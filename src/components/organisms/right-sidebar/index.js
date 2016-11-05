import React from 'react';
import { connect } from 'react-redux';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import LogoutIcon from 'material-ui/svg-icons/action/input';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import { postLogoutURL } from '../../../constants';


const mapStateToProps = (state) => ({
  theme: state.theme.theme,
});


const RightSidebar = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired,
  },

  handleLogout() {
    // eslint-disable-next-line no-undef
    window.localStorage.removeItem('ImagineVRAuthToken');
    this.context.router.push(postLogoutURL);
  },

  render() {
    return (
      <List>
        <ListItem
          leftIcon={<LogoutIcon />}
          primaryText="Logout"
          onClick={this.handleLogout}
        />
        <Divider />
        <ListItem
          leftIcon={<SettingsIcon />}
          primaryText="Settings"
        />
      </List>
    );
  },
});


export default connect(mapStateToProps)(RightSidebar);
