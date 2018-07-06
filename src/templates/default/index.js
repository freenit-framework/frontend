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
  render() {
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <IconButton color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit" style={styles.flex}>
              Title
            </Typography>
            <Button color="inherit">Login</Button>
          </Toolbar>
        </AppBar>
        {this.props.children}
      </div>
    )
  }
}


Template.propTypes = {
  children: PropTypes.node,
}


export default Template

