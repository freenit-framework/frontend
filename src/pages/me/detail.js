import React from 'react'
import { withStore } from 'store'

// Components
import {
  Button,
  Paper,
  TextField,
} from '@material-ui/core'

import { errorResponse } from 'utils'
import Template from 'templates/default/detail'
import styles from './styles'


class Me extends React.Component {
  state = {
    email: '',
  }

  constructor(props) {
    super(props)
    this.fetch()
  }

  fetch = async () => {
    const { store } = this.props
    const response = await store.me.fetch()
    if (!response.ok) {
      const error = errorResponse(response)
      store.notification.show(error.message)
    } else {
      this.setState({
        email: response.email,
      })
    }
  }

  handleEmail = (event) => {
    this.setState({ email: event.target.value })
  }

  handleEmailCancel = () => {
    this.setState({ email: this.props.store.me.detail.email })
  }

  handleSubmit = async (event) => {
    const { me, notification } = this.props.store
    event.preventDefault()
    const response = await me.edit({ email: this.state.email })
    if (!response.ok) {
      notification.show('Error editing me')
    }
  }

  render() {
    const me = this.props.store.me.detail
    return (
      <Template style={{}}>
        <Paper style={styles.root}>
          <form onSubmit={this.handleSubmit} style={styles.form}>
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              value={this.state.email}
              onChange={this.handleEmail}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              style={styles.button}
              disabled={me.email === this.state.email}
            >
              Save
            </Button>
            <Button
              variant="contained"
              style={styles.button}
              disabled={me.email === this.state.email}
              onClick={this.handleEmailCancel}
            >
              Cancel
            </Button>
          </form>
        </Paper>
      </Template>
    )
  }
}


export default withStore(Me)
