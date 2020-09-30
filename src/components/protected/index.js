import React from 'react'
import PropTypes from 'prop-types'
import { withStore } from '../../store'


class ProtectedComponent extends React.Component {
  constructor(props) {
    super(props)
    this.protect()
  }

  protect = async () => {
    const { auth, profile } = this.props.store
    const response = await auth.refresh()
    if (!response.ok) {
      if (this.props.secure) {
        this.props.store.history.push('/')
      }
    } else if (!profile.detail.id) {
      profile.fetch()
    }
  }

  render() {
    return null
  }
}


ProtectedComponent.propTypes = {
  secure: PropTypes.bool,
  store: PropTypes.shape({
    auth: PropTypes.shape({
      refresh: PropTypes.func.isRequired,
    }),
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    profile: PropTypes.shape({
      detail: PropTypes.shape({
        id: PropTypes.number.isRequired,
      }),
      fetch: PropTypes.func.isRequired,
    }),
  }).isRequired,
}


ProtectedComponent.defaultProps = {
  secure: false,
}


export default withStore(ProtectedComponent)
