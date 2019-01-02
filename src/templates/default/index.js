import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link, withRouter } from 'react-router-dom'
import { observer } from 'mobx-react'

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
import MenuIcon from '@material-ui/icons/Menu'

import EmptyTemplate from 'templates/empty'
import store from 'store'
import styles from './styles'


class Template extends Component {
  state = {
    showMenu: false,
  }

  handleMenuOpen = () => {
    this.setState({ showMenu: true })
  }

  handleMenuClose = () => {
    this.setState({ showMenu: false })
  }

  handleLogout = () => {
    this.props.store.auth.auth = false
    this.props.store.auth.email = ''
    this.props.store.auth.password = ''
    this.props.history.push('/landing')
  }

  render() {
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
    const AuthButton = this.props.store.auth.auth ? LoggedinButton : AnonButton
    const menuButtonAction = this.props.store.auth.auth ? this.handleMenuOpen : null
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <IconButton color="inherit" onClick={menuButtonAction}>
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit" style={styles.flex}>
              {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
              Frontend Startkit - {this.props.store.title.title}
            </Typography>
            {AuthButton}
          </Toolbar>
        </AppBar>
        <EmptyTemplate secure={this.props.secure}>
          {this.props.children}
          <Drawer open={this.state.showMenu} onClose={this.handleMenuClose}>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="title" color="inherit" style={styles.flex}>
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
  store: PropTypes.shape({
    auth: PropTypes.shape({
      auth: PropTypes.bool.isRequired,
      email: PropTypes.string.isRequired,
      login: PropTypes.func.isRequired,
      password: PropTypes.string.isRequired,
    }).isRequired,
    title: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  title: PropTypes.string,
}


export default withRouter(observer((props) => <Template {...props} store={store} />))
