import React from 'react'
import PropTypes from 'prop-types'

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

class ChangePassword extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      password: '',
    }
  }

  handleSubmit = async event => {
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

  handlePassword = event => {
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
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  store: PropTypes.shape({
    auth: PropTypes.shape({
      changePassword: PropTypes.func.isRequired,
    }).isRequired,
    notification: PropTypes.shape({
      show: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
}

export default withStore(ChangePassword)
