import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

// Components
import {
  Button,
  Paper,
  TextField,
} from '@material-ui/core'

import EmptyTemplate from 'templates/empty/detail'
import styles from './styles'
import { withStore } from 'store'


class Login extends Component {
  state = {
    email: '',
    password: '',
  }

  handleSubmit = async (event) => {
    event.preventDefault()
    const { auth, notification } = this.props.store
    const { email, password } = this.state
    const response = await auth.login(email, password)
    if (response.ok) {
      this.props.history.push('/dashboard')
      auth.refresh(/* notify callback */)
    } else {
      notification.show(response.response.data.message)
    }
  }

  handleEmail = (event) => {
    this.setState({ email: event.target.value })
  }

  handlePassword = (event) => {
    this.setState({ password: event.target.value })
  }

  render() {
    return (
      <EmptyTemplate style={{}}>
        <div style={styles.root}>
          <Paper style={styles.paper}>
            <div>
              <h1>Login</h1>
              <form style={styles.form} onSubmit={this.handleSubmit}>
                <div>
                  <TextField
                    label="Email"
                    margin="normal"
                    value={this.state.email}
                    onChange={this.handleEmail}
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
                    value={this.state.password}
                    onChange={this.handlePassword}
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
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  store: PropTypes.shape({}).isRequired,
}


export default withRouter(withStore(Login))
