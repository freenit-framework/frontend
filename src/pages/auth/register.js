import React from 'react'
import { observer } from 'mobx-react'

// Components
import { Button, Paper, TextField } from '@material-ui/core'

import styles from './styles'
import { store } from '../../store'
import Template from '../../templates/empty/detail'

@observer
class Register extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      repeatPassword: '',
    }
  }

  handleSubmit = async (event) => {
    event.preventDefault()
    const { auth, notification } = store
    const { password, repeatPassword } = this.state
    if (password !== repeatPassword) {
      notification.show('Passwords must match!')
      return
    }
    const response = await auth.register(this.state.email, this.state.password)
    if (response.ok) {
      notification.show('success')
    } else {
      notification.show(response.error)
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

export default Register
