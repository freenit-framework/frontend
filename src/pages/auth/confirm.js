import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

// Components
import {
  // Button,
  Paper,
} from '@material-ui/core'

import styles from './styles'
import Template from '../../templates/empty/detail'
import { store } from '../../store'
import { errors } from '../../utils'

@observer
class Confirm extends React.Component {
  state = {
    message: 'Trying to confirm account ...',
  }

  constructor(props) {
    super(props)
    this.fetch()
  }

  fetch = async () => {
    const { match } = this.props
    const { auth, notification } = store
    const response = await auth.confirm(match.params.token)
    if (response.ok) {
      const message = [
        <div key="message">Your account is confirmed</div>,
        <div key="login">
          You may <Link to="/login">login</Link> now
        </div>,
      ]
      this.setState({ message })
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
          <Paper style={{ ...styles.paper, flexDirection: 'column' }}>
            <div>{this.state.message}</div>
          </Paper>
        </div>
      </Template>
    )
  }
}

Confirm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  token: PropTypes.string.isRequired,
}

export default Confirm
