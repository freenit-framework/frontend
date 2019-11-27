import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { errors } from 'utils'

// Components
import {
  Button,
  Paper,
  TextField,
} from '@material-ui/core'

import Template from 'templates/empty/detail'
import styles from './styles'
import { withStore } from 'store'


class Login extends React.Component {
  state = {
    email: '',
    password: '',
  }

  handleSubmit = async (event) => {
    event.preventDefault()
    const { auth, history, notification } = this.props.store
    const { email, password } = this.state
    const response = await auth.login(email, password)
    if (response.ok) {
      history.push('/dashboard')
      auth.refresh()
    } else {
      const error = errors(response)
      notification.show(error.message)
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
      <Template style={{}}>
        <div style={styles.root}>
          <Paper style={styles.paper}>
            <div>
              <h1>Login</h1>
              <form style={styles.form} onSubmit={this.handleSubmit}>
                <div>
                  <TextField
                    required
                    autoFocus
                    label="Email"
                    margin="normal"
                    data-id="email"
                    value={this.state.email}
                    onChange={this.handleEmail}
                    type="email"
                  />
                </div>
                <div>
                  <TextField
                    required
                    label="Password"
                    type="password"
                    margin="normal"
                    data-id="password"
                    value={this.state.password}
                    onChange={this.handlePassword}
                  />
                </div>
                <div style={styles.button}>
                  <Button variant="contained" type="submit">
                    Login
                  </Button>
                </div>
                <Link to="/reset">
                  forgot password?
                </Link>
              </form>
            </div>
          </Paper>
        </div>
      </Template>
    )
  }
}


Login.propTypes = {
  store: PropTypes.shape({}).isRequired,
}


export default withStore(Login)
