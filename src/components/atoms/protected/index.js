import React from 'react'
import PropTypes from 'prop-types'
import { withStore } from 'store'
import { withRouter } from 'react-router'


class ProtectedComponent extends React.Component {
  async componentDidMount() {
    const { auth } = this.props.store
    const response = await auth.refresh()
    if (!response.ok) {
      if (this.props.secure) {
        this.props.history.push('/')
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { auth } = this.props.store.auth.detail
    const prevAuth = prevProps.store.auth.detail.auth
    const { secure } = this.props
    if (!auth && !prevAuth && secure) {
      this.props.history.push('/')
    }
  }

  render() {
    return null
  }
}


ProtectedComponent.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  secure: PropTypes.bool,
}


export default withRouter(withStore(ProtectedComponent))
