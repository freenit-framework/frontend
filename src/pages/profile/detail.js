import React from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'

// Components
import { Button, Paper, TextField } from '@material-ui/core'

import styles from './styles'
import { store } from '../../store'
import { errors } from '../../utils'

class Profile extends React.Component {
  state = {
    email: '',
  }

  constructor(props) {
    super(props)
    this.fetch()
  }

  fetch = async () => {
    const response = await store.profile.fetch()
    if (!response.ok) {
      const error = errors(response)
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
    this.setState({ email: store.profile.detail.email })
  }

  handleSubmit = async (event) => {
    const { profile, notification } = store
    event.preventDefault()
    const response = await profile.edit({ email: this.state.email })
    if (!response.ok) {
      notification.show('Error editing profile')
    }
  }

  render() {
    const profile = store.profile.detail
    const style = this.props.style
      ? {
          ...styles.root,
          ...this.props.style,
        }
      : styles.root
    return (
      <Paper style={style}>
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
            disabled={profile.email === this.state.email}
          >
            Save
          </Button>
          <Button
            variant="contained"
            style={styles.button}
            disabled={profile.email === this.state.email}
            onClick={this.handleEmailCancel}
          >
            Cancel
          </Button>
        </form>
      </Paper>
    )
  }
}

export default observer(Profile)
