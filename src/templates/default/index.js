import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link, withRouter } from 'react-router-dom'
import { withStore } from 'store'

// Components
import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import Drawer from '@material-ui/core/Drawer'
import IconButton from '@material-ui/core/IconButton'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import MenuItem from '@material-ui/core/MenuItem'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

// Icons
import CloseIcon from '@material-ui/icons/Clear'
import DashboardIcon from '@material-ui/icons/Dashboard'

import EmptyTemplate from 'templates/empty/detail'
import styles from './styles'


class Template extends Component {
  state = {
    showMenu: false,
  }

  handleLogout = async () => {
    const { auth  } = this.props.store
    const response = await auth.logout()
    if (response.ok === undefined) {
      this.props.history.push('/')
    }
  }

  render() {
    const { auth  } = this.props.store
    const AnonButton = (
      <Link to="/login" style={styles.login}>
        <Button color="inherit">Login</Button>
      </Link>
    )
    const LoggedinButton = (
      <Button color="inherit" onClick={this.handleLogout}>
        Logout
      </Button>
    )
    const AuthButton = auth.detail.ok ? LoggedinButton : AnonButton
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h5" color="inherit" style={styles.flex}>
              {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
              Startkit
            </Typography>
            {AuthButton}
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


export default withRouter(withStore(Template))
