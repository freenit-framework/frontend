import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link, withRouter } from 'react-router-dom'

// Components
import AppBar from '@material-ui/core/AppBar'
import Drawer from '@material-ui/core/Drawer'
import IconButton from '@material-ui/core/IconButton'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import MenuItem from '@material-ui/core/MenuItem'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

// Icons
import CloseIcon from '@material-ui/icons/Clear'
import DashboardIcon from '@material-ui/icons/Dashboard'

import EmptyTemplate from 'templates/empty'
import styles from './styles'


class Template extends Component {
  state = {
    showMenu: false,
  }

  render() {
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h5" color="inherit" style={styles.flex}>
              {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
              Startkit
            </Typography>
          </Toolbar>
        </AppBar>
        <EmptyTemplate secure={this.props.secure} style={this.props.style}>
          {this.props.children}
          <Drawer open={this.state.showMenu} onClose={this.handleMenuClose}>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h5" color="inherit" style={styles.flex}>
                  &nbsp;
                </Typography>
                <IconButton color="inherit" onClick={this.handleMenuClose}>
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
            <div
              role="button"
              onClick={this.handleMenuClose}
              style={styles.menu}
              tabIndex={0}
              onKeyDown={this.handleMenuClose}
            >
              <Link to="/" style={styles.a}>
                <MenuItem>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  Dashboard
                </MenuItem>
              </Link>
            </div>
          </Drawer>
        </EmptyTemplate>
      </div>
    )
  }
}


Template.propTypes = {
  children: PropTypes.node,
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  secure: PropTypes.bool,
  style: PropTypes.shape({}),
  title: PropTypes.string,
}


export default withRouter(Template)
