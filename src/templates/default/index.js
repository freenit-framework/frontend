import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import styles from './styles'


class Template extends Component {
  redirectLogin = () => {
    this.context.router.history.push('/login')
  }

  render() {
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <IconButton color="inherit" aria-label="Menu">
              <MenuIcon/>
            </IconButton>
            <Typography variant="title" color="inherit" style={styles.flex}>
              Title
            </Typography>
            <Button color="inherit" onClick={this.redirectLogin}>Login</Button>
          </Toolbar>
        </AppBar>
        {this.props.children}
      </div>
    )
  }
}


Template.contextTypes = {
  router: PropTypes.object.isRequired,
}


Template.propTypes = {
  children: PropTypes.node,
}


export default Template

