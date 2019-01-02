import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import { withRouter } from 'react-router-dom'
import { observer } from 'mobx-react'
import store from 'store'


class ProtectedComponent extends Component {
  logged = false

  componentWillMount() {
    this.props.store.auth.refresh()
  }

  componentWillUnmount() {
    this.logged = false
    clearInterval(this.interval)
  }

  render() {
    const { auth, error } = this.props.store
    if (auth.status === 200) {
      if (!this.logged) {
        this.logged = true
        this.interval = setInterval(
          async () => {
            await auth.refresh()
            if (2 * auth.accessExpire > auth.refreshExpire) {
              error.message = 'Refresh token is soon to expire! Please go to login page.'
              error.open = true
            }
          },
          (auth.accessExpire - 1) * 1000,
        )
        auth.auth = true
      }
    } else if (auth.status >= 400) {
      if (this.logged) {
        clearInterval(this.interval)
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
  store: PropTypes.shape({
    auth: PropTypes.shape({
      status: PropTypes.number.isRequired,
      accessExpire: PropTypes.number.isRequired,
      accessToken: PropTypes.string.isRequired,
      refresh: PropTypes.func.isRequired,
      refreshExpire: PropTypes.number.isRequired,
      refreshToken: PropTypes.string.isRequired,
    }).isRequired,
    error: PropTypes.shape({
      message: PropTypes.string.isRequired,
      open: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
}


export default withRouter(observer((props) => <ProtectedComponent {...props} store={store} />))
