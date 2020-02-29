import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

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
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      password: '',
    }
  }

  handleSubmit = async event => {
    event.preventDefault()
    const { auth, history, notification } = this.props.store
    const { email, password } = this.state
    const response = await auth.login(email, password)
    if (response.ok) {
      history.push(this.props.redirect || '/dashboard')
      auth.refresh()
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

Login.propTypes = {
  store: PropTypes.shape({
    auth: PropTypes.shape({
      login: PropTypes.func.isRequired,
      refresh: PropTypes.func.isRequired,
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    notification: PropTypes.shape({
      show: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  redirect: PropTypes.str,
}

export default withStore(Login)
