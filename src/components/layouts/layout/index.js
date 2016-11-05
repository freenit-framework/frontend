import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import AppBar from 'material-ui/AppBar';
import FlatButton from 'material-ui/FlatButton';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import ReorderIcon from 'material-ui/svg-icons/action/reorder';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import IconButton from 'material-ui/IconButton';
import { pathnameToBreadcrumbs } from '../../../utils';
import Home from '../../../pages/home';
import meActions from './actions/me';
import leftSidebarActions from './actions/left-sidebar';
import LeftSidebar from '../../organisms/left-sidebar';
import rightSidebarActions from './actions/right-sidebar';
import RightSidebar from '../../organisms/right-sidebar';
import { isLoggedIn } from '../../../utils';
import getStyles from './styles';


const mapStateToProps = (state) => ({
  leftSidebar: state.leftSidebar.content,
  leftSidebarOpen: state.leftSidebar.open,
  me: state.me.user,
  rightSidebar: state.rightSidebar.content,
  rightSidebarOpen: state.rightSidebar.open,
});


const Layout = React.createClass({
  propTypes: {
    children: React.PropTypes.node,
    dispatch: React.PropTypes.func.isRequired,
    leftSidebar: React.PropTypes.node,
    leftSidebarOpen: React.PropTypes.bool,
    location: React.PropTypes.object,
    me: React.PropTypes.object,
    rightSidebar: React.PropTypes.node,
    rightSidebarOpen: React.PropTypes.bool,
  },

  contextTypes: {
    router: React.PropTypes.object.isRequired,
    muiTheme: React.PropTypes.object.isRequired,
  },

  getDefaultProps() {
    return {
      location: {
        pathname: '',
      },
    };
  },

  componentWillMount() {
    if (isLoggedIn()) {
      this.props.dispatch(meActions.me());
    }
  },

  handleOpenLeftSidebar() {
    this.props.dispatch(leftSidebarActions.open(<LeftSidebar />));
  },

  handleCloseLeftSidebar() {
    this.props.dispatch(leftSidebarActions.close());
  },

  handleOpenRightSidebar() {
    this.props.dispatch(rightSidebarActions.open(<RightSidebar />));
  },

  handleCloseRightSidebar() {
    this.props.dispatch(rightSidebarActions.close());
  },

  handleTitleTouchTap() {
    this.context.router.push('/');
  },

  render() {
    const theme = this.context.muiTheme;
    const styles = getStyles(theme, this.props.me);
    const content = this.props.children ? this.props.children : <Home />;
    const breadCrumbs = pathnameToBreadcrumbs(this.props.location.pathname);
    const closeLeftSidebarIcon = (
      <FlatButton
        icon={<CloseIcon />}
        onClick={this.handleCloseLeftSidebar}
      />
    );
    const closeRightSidebarIcon = (
      <FlatButton
        icon={<CloseIcon />}
        onClick={this.handleCloseRightSidebar}
      />
    );
    return (
      <div>
        <Drawer
          open={this.props.leftSidebarOpen}
        >
          <MenuItem
            primaryText="&nbsp;"
            style={styles.settings.item}
            rightIcon={closeLeftSidebarIcon}
          />
          {this.props.leftSidebar}
        </Drawer>
        <Drawer
          openSecondary
          open={this.props.rightSidebarOpen}
        >
          <MenuItem
            primaryText="&nbsp;"
            style={styles.settings.item}
            rightIcon={closeRightSidebarIcon}
          />
          {this.props.rightSidebar}
        </Drawer>
        <AppBar
          title={<span style={styles.title}>MyApp</span>}
          onTitleTouchTap={this.handleTitleTouchTap}
          style={styles.appBar}
          iconElementLeft={
            <IconButton onTouchTap={this.handleOpenLeftSidebar} >
              <ReorderIcon />
            </IconButton>
                          }
          iconElementRight={
            <IconButton onTouchTap={this.handleOpenRightSidebar} >
              <ReorderIcon />
            </IconButton>
                           }
        />
        <div style={styles.breadcrumbs}>
          {breadCrumbs.map(element => (
            <span key={element.name}>
              / <Link
                style={styles.breadcrumbs.link}
                key={element.name}
                to={element.path}
              >
                {element.name}
              </Link> /
            </span>
          ))}
        </div>
        <div style={styles.content}>
          {content}
        </div>
        <div style={styles.footer}>
          All rights reserved 2016.
        </div>
      </div>
    );
  },
});


export default connect(mapStateToProps)(Layout);
