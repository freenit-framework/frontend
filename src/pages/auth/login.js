import React from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../../auth'

// Components
import {
  Button,
  Paper,
  TextField,
} from '@material-ui/core'

import styles from './styles'
import Template from '../../templates/empty/detail'
import { withStore } from '../../store'
import { errors } from '../../utils'


class Login extends React.Component {
  state = {
    email: '',
    password: '',
  }

  handleSubmit = async event => {
    event.preventDefault()
    const { history, notification } = this.props.store
    const { email, password } = this.state
    const response = await auth.login(email, password)
    if (response.ok) {
      history.push(this.props.redirect || '/dashboard')
      auth.refresh()
      const { onSuccess } = this.props
      if (onSuccess) { onSuccess(email, password) }
    } else {
      const error = errors(response)
      notification.show(error.message)
    }
  }

  handleEmail = event => {
    this.setState({ email: event.target.value })
  }

  handlePassword = event => {
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
              <Link to="/">Home</Link>
            </div>
          </Paper>
        </div>
      </Template>
    )
  }
}


export default withStore(Login)
