import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import { withRouter, Link } from 'react-router-dom'
import { observer } from 'mobx-react'
import store from 'store'
import styles from './styles'


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
      if (2 * auth.accessExpire > auth.refreshExpire) {
        error.message = (
          <div>
            Refresh token is soon to expire. Please go to &nbsp;
            <Link to="/login" style={styles.link}>Login</Link>
          </div>
        )
        error.open = true
      }
      if (!this.logged) {
        this.interval = setInterval(
          () => { auth.refresh() },
          (auth.accessExpire - 1) * 1000,
        )
        this.logged = true
        auth.auth = true
      }
    } else if (auth.status !== null) {
      auth.auth = false
      if (this.logged) {
        error.message = (
          <div>
            Error refreshing login token. Please go to &nbsp;
            <Link to="/login" style={styles.link}>Login</Link>
          </div>
        )
        error.open = true
        clearInterval(this.interval)
      } else {
        this.props.history.push('/landing')
      }
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
