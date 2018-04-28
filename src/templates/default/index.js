import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import ReorderIcon from 'material-ui/svg-icons/action/reorder';
import HomeIcon from 'material-ui/svg-icons/action/home';
import IconButton from 'material-ui/IconButton';
import Drawer from 'material-ui/Drawer';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import Settings from '../../components/molecules/settings';
import styles from './styles';
import actions from './actions.js';


const mapStateToProps = (state) => ({
  settingsOpen: state.settings.open,
});


class Template extends React.Component {
  handleHomeTouchTap = () => {
    this.context.router.history.push('/');
  }

  componentWillMount() {
    this.props.close();
  }

  render() {
    return (
      <div style={styles.content}>
        <Drawer
          openSecondary
          open={this.props.settingsOpen}
        >
          <AppBar
            title="menu"
            iconElementLeft={
              <IconButton onClick={this.props.toggleSettings} >
                <CloseIcon />
              </IconButton>
            }
          />
          <Settings />
        </Drawer>

        <AppBar
          title="Tilda Center"
          iconElementLeft={
            <IconButton onClick={this.handleHomeTouchTap} >
              <HomeIcon />
            </IconButton>
          }
          iconElementRight={
            <IconButton onClick={this.props.toggleSettings} >
              <ReorderIcon />
            </IconButton>
          }
        />
        {this.props.children}
      </div>
    );
  }
}


Template.propTypes = {
  children: PropTypes.node,
  close: PropTypes.func.isRequired,
  settingsOpen: PropTypes.bool,
  toggleSettings: PropTypes.func.isRequired,
}


Template.contextTypes = {
  router: PropTypes.object.isRequired,
}


Template.defaultProps = {
  settingsOpen: false,
}

export default connect(mapStateToProps, actions)(Template)
