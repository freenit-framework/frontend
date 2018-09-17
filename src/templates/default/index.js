import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import EmptyTemplate from 'templates/empty'
import actions from 'templates/empty/actions'
import styles from './styles'


const mapStateToProps = (state) => ({
  open: state.error.open,
})


class Template extends Component {
  state = {
    open: false,
    message: '',
  }

  redirectLogin = () => {
    this.context.router.history.push('/login')
  }

  render() {
    return (
      <EmptyTemplate secure={this.props.secure}>
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
      </EmptyTemplate>
    )
  }
}


Template.contextTypes = {
  router: PropTypes.object.isRequired,
}


Template.propTypes = {
  children: PropTypes.node,
  secure: PropTypes.bool,
}


export default connect(mapStateToProps, actions)(Template)
