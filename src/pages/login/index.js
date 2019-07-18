import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { observer } from 'mobx-react'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import EmptyTemplate from 'templates/empty'
import store from 'store'
import { refreshExecute } from 'utils'
import styles from './styles'


class Login extends Component {
  handleSubmit = async (event) => {
    event.preventDefault()
    const { auth, error } = this.props.store
    await auth.login()
    auth.password = ''
    if (auth.auth) {
      refreshExecute()
      this.props.history.push('/')
    } else {
      error.message = auth.error
      error.open = true
    }
  }

  handleEmail = (event) => {
    const { auth } = this.props.store
    auth.email = event.target.value
  }

  handlePassword = (event) => {
    const { auth } = this.props.store
    auth.password = event.target.value
  }

  render() {
    const { auth } = this.props.store
    return (
      <EmptyTemplate>
        <div style={styles.root}>
          <Paper style={styles.paper}>
            <div>
              <h1>Login</h1>
              <form style={styles.form} onSubmit={this.handleSubmit}>
                <div>
                  <TextField
                    label="Email"
                    margin="normal"
                    onChange={this.handleEmail}
                    value={auth.email}
                    type="email"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <TextField
                    label="Password"
                    type="password"
                    margin="normal"
                    onChange={this.handlePassword}
                    value={auth.password}
                    required
                  />
                </div>
                <div style={styles.button}>
                  <Button variant="contained" type="submit">
                    Login
                  </Button>
                </div>
              </form>
            </div>
          </Paper>
        </div>
      </EmptyTemplate>
    )
  }
}


Login.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  store: PropTypes.shape({
    auth: PropTypes.shape({
      auth: PropTypes.bool.isRequired,
      email: PropTypes.string.isRequired,
      login: PropTypes.func.isRequired,
      password: PropTypes.string.isRequired,
    }).isRequired,
    error: PropTypes.shape({
      message: PropTypes.string.isRequired,
      open: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
}


export default withRouter(observer((props) => <Login {...props} store={store} />))
