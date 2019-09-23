import React from 'react'
import PropTypes from 'prop-types'
import { withStore } from 'store'
import { withRouter } from 'react-router'


class ProtectedComponent extends React.Component {
  async componentDidMount() {
    const { auth } = this.props.store
    const response = await auth.refresh(/* notify callback */)
    if (!response.ok) {
      if (this.props.secure) {
        this.props.history.push('/')
      }
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
