import React from 'react'
import PropTypes from 'prop-types'
import Template from 'templates/default'


class UserDetail extends React.Component {
  render() {
    return (
      <Template>
        detail
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
}


export default UserDetail
