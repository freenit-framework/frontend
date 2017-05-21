import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import HomeIcon from 'material-ui/svg-icons/action/home';
import ReorderIcon from 'material-ui/svg-icons/action/reorder';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import IconButton from 'material-ui/IconButton';
import Home from '../../pages/home';
import Settings from '../../components/molecules/settings';
import actions from './actions/settings';


const mapStateToProps = (state) => ({
  settings: state.settings.settings,
  settingsOpen: state.settings.open,
});


class Template extends Component {
  constructor(props) {
    super(props);
    this.handleHomeTouchTap = () => {
      this.context.router.push('/');
    };

    this.handleOpenSettings = () => {
      this.props.dispatch(actions.open(<Settings />));
    };

    this.handleCloseSettings = () => {
      this.props.dispatch(actions.close());
    };
  }


  render() {
    const theme = this.context.muiTheme;
    const header = this.context.muiTheme.appBar.height;
    const footer = this.context.muiTheme.footer.height;
    const headerFooter = header + footer;
    const allButContent = headerFooter + (2 * theme.content.padding) + theme.breadcrumbs.height;
    const styles = {
      inactive: {
        color: this.context.muiTheme.inactive.color,
      },

      content: {
        fontFamily: 'Roboto, sans-serif',
        padding: `${theme.content.padding}px`,
        height: `calc(100vh - ${allButContent}px)`,
        overflow: 'auto',
      },

      settings: {
        item: {
          cursor: 'pointer',
        },
      },

      footer: {
        height: `${theme.footer.height}px`,
        lineHeight: `${theme.footer.height}px`,
        color: `${theme.footer.color}`,
        fontFamily: `${theme.footer.fontFamily}`,
        boxShadow: `${theme.footer.boxShadow}`,
        textAlign: 'center',
      },

      breadcrumbs: {
        height: `${theme.breadcrumbs.height}px`,
        lineHeight: `${theme.breadcrumbs.height}px`,
        textAlign: 'right',
        padding: '0 10px',
        backgroundColor: theme.breadcrumbs.backgroundColor,
        link: {
          color: theme.palette.primary2Color,
        },
      },
    };
    const content = this.props.children ? this.props.children : <Home />;
    return (
      <div>
        <Drawer
          openSecondary
          open={this.props.settingsOpen}
        >
          <MenuItem
            primaryText="&nbsp;"
            style={styles.settings.item}
            rightIcon={<CloseIcon onClick={this.handleCloseSettings} />}
          />
          {this.props.settings}
        </Drawer>
        <AppBar
          title="MaterialUI Starter"
          iconElementLeft={
            <IconButton onTouchTap={this.handleHomeTouchTap} >
              <HomeIcon />
            </IconButton>
                          }
          iconElementRight={
            <IconButton onTouchTap={this.handleOpenSettings} >
              <ReorderIcon />
            </IconButton>
                           }
        />
        <div style={styles.content}>
          {content}
        </div>
        <div style={styles.footer}>
          Made by: <a href="http://tilda.center/" style={{ color: theme.footer.a.color }}>
            Tilda Center
          </a>
        </div>
      </div>
    );
  }
}

Template.propTypes = {
  children: PropTypes.node,
  settings: PropTypes.node,
  settingsOpen: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

Template.contextTypes = {
  router: PropTypes.object.isRequired,
  muiTheme: PropTypes.object.isRequired,
};

Template.defaultProps = {
  notifications: '',
  location: {
    pathname: '',
  },
};

// eslint-disable-next-line new-cap
const TemplateDND = DragDropContext(HTML5Backend)(Template);
export default connect(mapStateToProps)(TemplateDND);
