import React from 'react'
import PropTypes from 'prop-types'

// Components
import {
  Button,
  Paper,
  TextField,
} from '@material-ui/core'

import styles from './styles'
import { withStore } from '../../store'
import { errors } from '../../utils'

class Me extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
    }
    this.fetch()
  }

  fetch = async () => {
    const { store } = this.props
    const response = await store.me.fetch()
    if (!response.ok) {
      const error = errors(response)
      store.notification.show(error.message)
    } else {
      this.setState({
        email: response.email,
      })
    }
  }

  handleEmail = event => {
    this.setState({ email: event.target.value })
  }

  handleEmailCancel = () => {
    this.setState({ email: this.props.store.me.detail.email })
  }

  handleSubmit = async event => {
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
      <Paper style={styles.root}>
        <form onSubmit={this.handleSubmit} style={styles.form}>
          <TextField
            required
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
    )
  }
}

Me.propTypes = {
  store: PropTypes.shape({
    me: PropTypes.shape({
      detail: PropTypes.shape({
        email: PropTypes.string.isRequired,
      }).isRequired,
      edit: PropTypes.func.isRequired,
      fetch: PropTypes.func.isRequired,
    }).isRequired,
    notification: PropTypes.shape({
      show: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
}

export default withStore(Me)
