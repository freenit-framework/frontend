import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'

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
import actions from 'components/atoms/protected/actions'
import styles from './styles'


const mapStateToProps = state => ({
  open: state.error.open,
  authState: state.auth.state,
  title: state.title.title,
})


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
    const { auth, requestLogout, history } = this.props
    auth(false)
    requestLogout()
    history.push('/landing')
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
    const AuthButton = this.props.authState ? LoggedinButton : AnonButton
    const menuButtonAction = this.props.authState ? this.handleMenuOpen : null
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <IconButton color="inherit" onClick={menuButtonAction}>
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit" style={styles.flex}>
              {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
              Frontend Startkit - {this.props.title}
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
  auth: PropTypes.func.isRequired,
  authState: PropTypes.bool,
  children: PropTypes.node,
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  requestLogout: PropTypes.func.isRequired,
  secure: PropTypes.bool,
  title: PropTypes.string,
}


export default connect(mapStateToProps, actions)(withRouter(Template))
