import React from 'react';
import { List, ListItem } from 'material-ui/List';
import LogoutIcon from 'material-ui/svg-icons/action/input';
import Subheader from 'material-ui/Subheader';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { connect } from 'react-redux';
import SidebarTransitionGroup from '../../molecules/sidebar-transition-group';
import { themes } from '../../../constants';
import actions from '../../../containers/actions';
import './styles.css';


const styles = {
  subheader: {
    cursor: 'pointer',
  },
};


const mapStateToProps = (state) => ({
  theme: state.theme.theme,
});


const LeftSidebar = React.createClass({
  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    theme: React.PropTypes.object,
  },

  getInitialState() {
    return {
      selected: 'theme',
    };
  },

  handleTheme() {
    this.setState({
      selected: 'theme',
    });
  },

  handleOther() {
    this.setState({
      selected: 'other',
    });
  },

  handleThemeChange(_, value) {
    const theme = themes[value];
    if (theme) {
      this.setState({ themeName: value });
      this.props.dispatch(actions.changeTheme(theme));
    }
  },

  render() {
    const transitionTime = 400;
    const transition = `all ${transitionTime}ms ease-in`;
    const theme = (
      <RadioButtonGroup
        style={{ transition }}
        name="theme"
        onChange={this.handleThemeChange}
        defaultSelected={this.props.theme.name}
      >
        <RadioButton value="light" label="Light" />
        <RadioButton value="dark" label="Dark" />
      </RadioButtonGroup>
    );
    const other = (
      <List>
        <ListItem
          leftIcon={<LogoutIcon />}
          primaryText="Other"
        />
      </List>
    );
    return (
      <div>
        <Subheader style={styles.subheader} onTouchTap={this.handleTheme}>
          Theme
        </Subheader>
        <SidebarTransitionGroup>
          {this.state.selected === 'theme' ? theme : ''}
        </SidebarTransitionGroup>
        <Subheader style={styles.subheader} onTouchTap={this.handleOther}>
          Other
        </Subheader>
        <SidebarTransitionGroup>
          {this.state.selected === 'other' ? other : ''}
        </SidebarTransitionGroup>
      </div>
    );
  },
});


export default connect(mapStateToProps)(LeftSidebar);
