import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import styles from './styles'


class Login extends Component {
  state = {
    email: '',
    password: '',
  }

  handleSubmit = (event) => {
    event.preventDefault()
    console.log(this.state.email, this.state.password)
  }

  handleEmail = (event) => {
    this.setState({ email: event.target.value })
  }

  handlePassword = (event) => {
    this.setState({ password: event.target.value })
  }

  render() {
    return (
      <div style={styles.root}>
        <Paper style={styles.paper}>
          <div>
            <h1>Login</h1>
            <form style={styles.form} onSubmit={this.handleSubmit}>
              <div>
                <TextField
                  label="EMail"
                  margin="normal"
                  onChange={this.handleEmail}
                  value={this.state.email}
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
                  value={this.state.password}
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
    )
  }
}


export default Login
