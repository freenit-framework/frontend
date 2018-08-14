import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import styles from './styles'
import actions from './actions'


const mapStateToProps = (state) => ({
  token: state.login.token,
  error: state.login.error,
  errorDescription: state.login.description,
  status: state.login.status_code,
})


class Login extends Component {
  state = {
    email: '',
    password: '',
  }

  handleSubmit = (event) => {
    event.preventDefault()
    this.props.requestLogin({
      email: this.state.email,
      password: this.state.password,
    })
  }

  handleEmail = (event) => {
    this.setState({ email: event.target.value })
  }

  handlePassword = (event) => {
    this.setState({ password: event.target.value })
  }

  render() {
    const { token, error, errorDescription, status } = this.props
    console.log(token, error, errorDescription, status)
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


Login.propTypes = {
  requestLogin: PropTypes.func.isRequired,
  token: PropTypes.string,
}


export default connect(mapStateToProps, actions)(Login);
