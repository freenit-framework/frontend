import React from 'react'

// Components
import {
  Button,
  Paper,
  TextField,
} from '@material-ui/core'

import Template from '../../templates/empty/detail'
import { withStore } from '../../store'
import { errors } from '../../utils'
import styles from './styles'


class Reset extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
    }
  }

  handleSubmit = async event => {
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

  handleEmail = event => {
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


export default withStore(Reset)
