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


class Reset extends React.Component {
  state = {
    email: '',
  }

  handleSubmit = async (event) => {
    event.preventDefault()
    const { email } = this.state
    const { auth, notification } = this.props.store
    const response = await auth.reset(email)
    if (response.ok) {
      notification.show(`Email with instructions sent to ${email}`)
    } else {
      const error = errors(response)
      notification.show(error.message)
    }
  }

  handleEmail = (event) => {
    this.setState({ email: event.target.value })
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
                    label="Email"
                    margin="normal"
                    data-id="email"
                    value={this.state.email}
                    onChange={this.handleEmail}
                    type="email"
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


Reset.propTypes = {
  store: PropTypes.shape({}).isRequired,
}


export default withStore(Reset)
