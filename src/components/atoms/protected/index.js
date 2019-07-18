import React from 'react'
import { PropTypes } from 'prop-types'
import { withRouter } from 'react-router-dom'
import { observer } from 'mobx-react'
import store from 'store'


@observer
class ProtectedComponent extends React.Component {
  logged = false

  refreshExecute = async (timeout) => {
    await store.auth.refresh()
    if (2 * store.auth.accessExpire > store.auth.refreshExpire) {
      store.error.message = 'Refresh token is soon to expire! Please go to login page.'
      store.error.open = true
    }
    if (store.auth.status === 200)
    {
      this.refreshTimeout()
    }
  }

  refreshTimeout = () => {
    const accessTimeout = store.auth.accessExpire === 0
      ? 0
      : (store.auth.accessExpire - 5) * 1000
    this.timeout = setTimeout(this.refreshExecute, accessTimeout)
  }

  componentWillMount() {
    this.refreshExecute()
  }

  componentWillUnmount() {
    this.logged = false
    clearTimeout(this.timeout)
  }

  render() {
    const { auth, error } = store
    if (auth.status === 200) {
      if (!this.logged) {
        this.logged = true
      }
      auth.auth = true
    } else if (auth.status >= 400) {
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
