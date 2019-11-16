import React from 'react'
import { Link } from 'react-router-dom'
import { withStore } from 'store'

// Components
import {
  Button,
  Paper,
  TextField,
} from '@material-ui/core'

import Template from 'templates/empty/detail'
import styles from './styles'


class Register extends React.Component {
  state = {
    email: '',
    password: '',
    repeatPassword: '',
  }

  handleSubmit = async (event) => {
    event.preventDefault()
    const { auth, notification } = this.props.store
    const { password, repeatPassword } = this.state
    if (password !== repeatPassword) {
      notification.show('Passwords must match!')
      return
    }
    const result = await auth.register(
      this.state.email,
      this.state.password,
    )
    if (result.ok) {
      notification.show(
        <div>
          You are now registered!
          Once admin approves your account you should be
          able to &nbsp;
          <Link to="/login">
            login
          </Link>
        </div>
      )
    } else {
      notification.show(result.error)
    }
    this.setState({
      password: '',
      repeatPassword: '',
    })
  }

  handleEmail = (event) => {
    this.setState({ email: event.target.value })
  }

  handlePassword = (event) => {
    this.setState({ password: event.target.value })
  }

  handleRepeatPassword = (event) => {
    this.setState({ repeatPassword: event.target.value })
  }

  render() {
    return (
      <Template style={{}}>
        <div style={styles.root}>
          <Paper style={styles.paper}>
            <div>
              <h1>Register</h1>
              <form style={styles.form} onSubmit={this.handleSubmit}>
                <div>
                  <TextField
                    required
                    autoFocus
                    label="Email"
                    margin="normal"
                    data-id="email"
                    onChange={this.handleEmail}
                    value={this.state.email}
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
                    onChange={this.handlePassword}
                    value={this.state.password}
                  />
                </div>
                <div>
                  <TextField
                    required
                    label="Repeat Password"
                    type="password"
                    margin="normal"
                    data-id="repeatPassword"
                    onChange={this.handleRepeatPassword}
                    value={this.state.repeatPassword}
                  />
                </div>
                <div style={styles.button}>
                  <Button variant="contained" type="submit">
                    Register
                  </Button>
                </div>
              </form>
            </div>
          </Paper>
        </div>
      </Template>
    )
  }
}


export default withStore(Register)
