import React from 'react'
import { PropTypes } from 'prop-types'
import { withRouter } from 'react-router-dom'
import { observer } from 'mobx-react'
import store from 'store'
import { refreshExecute, timeoutClear } from 'utils'


@observer
class ProtectedComponent extends React.Component {
  logged = false

  componentWillMount() {
    refreshExecute()
  }

  componentWillUnmount() {
    this.logged = false
    timeoutClear()
  }

  render() {
    const { auth, error } = store
    if (auth.status === 200) {
      if (!this.logged) {
        this.logged = true
      }
      auth.auth = true
    } else if (auth.status >= 400) {
      timeoutClear()
      if (this.logged) {
        this.logged = false
        error.message = 'Error refreshing login token! Please login!'
        error.open = true
        this.props.history.push('/login')
      } else {
        this.props.history.push('/landing')
      }
      auth.auth = false
    }
    return null
  }
}


ProtectedComponent.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
}


export default withRouter(ProtectedComponent)
