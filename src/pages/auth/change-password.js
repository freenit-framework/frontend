import React from 'react'
import PropTypes from 'prop-types'
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


class ChangePassword extends React.Component {
  state = {
    password: '',
  }

  handleSubmit = async (event) => {
    event.preventDefault()
    const { password } = this.state
    const { auth, notification } = this.props.store
    const response = await auth.changePassword(
      password,
      this.props.match.params.token,
    )
    if (response.ok) {
      notification.show('You can login with your new password')
    } else {
      const error = errors(response)
      notification.show(error.message)
    }
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
              <h1>Reset Password</h1>
              <form style={styles.form} onSubmit={this.handleSubmit}>
                <div>
                  <TextField
                    required
                    autoFocus
                    label="Password"
                    data-id="password"
                    value={this.state.password}
                    onChange={this.handlePassword}
                    type="password"
                  />
                </div>
                <div style={styles.button}>
                  <Button variant="contained" type="submit">
                    Reset Password
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


ChangePassword.propTypes = {
  store: PropTypes.shape({}).isRequired,
}


export default withStore(ChangePassword)
