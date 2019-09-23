import React from 'react'
import PropTypes from 'prop-types'
import Template from 'templates/default'
import { withStore } from 'store'


class UserDetail extends React.Component {
  constructor(props) {
    super(props)
    props.store.user.fetch(props.match.params.id)
  }

  render() {
    return (
      <Template secure>
        email: {this.props.store.user.detail.email}
      </Template>
    )
  }
}


UserDetail.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  store: PropTypes.shape({
    user: PropTypes.shape({
      detail: PropTypes.shape({
        email: PropTypes.string.isRequired,
      }).isRequired,
      fetch: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
}


export default withStore(UserDetail)
