import React from 'react'
import PropTypes from 'prop-types'

// Components
import {
  // Button,
  Paper,
} from '@material-ui/core'

import styles from './styles'
import Template from '../../templates/empty/detail'
import { withStore } from '../../store'
import { errors } from '../../utils'


class Confirm extends React.Component {
  state = {
    message: 'Trying to confirm account ...'
  }

  constructor(props) {
    super(props)
    this.fetch()
  }

  fetch = async () => {
    const { match, store } = this.props
    const { auth, notification } = store
    const response = await auth.confirm(match.params.token)
    if (response.ok) {
      this.setState({ message: 'Your account is confirmed' })
    } else {
      this.setState({ message: 'Error confirming account' })
      const error = errors(response)
      notification.show(error.message)
    }
  }

  render() {
    return (
      <Template style={{}}>
        <div style={styles.root}>
          <Paper style={styles.paper}>
            {this.state.message}
          </Paper>
        </div>
      </Template>
    )
  }
}


Confirm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.str.isRequired,
    }).isRequired,
  }).isRequired,
  store: PropTypes.shape({
    auth: PropTypes.shape({
      confirm: PropTypes.func.isRequired,
    }).isRequired,
    notification: PropTypes.shape({
      show: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  token: PropTypes.str.isRequired,
}

export default withStore(Confirm)
