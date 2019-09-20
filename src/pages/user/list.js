import React from 'react'
import PropTypes from 'prop-types'

// Components
import { Button } from '@material-ui/core'

import Template from 'templates/default'
import { withStore } from 'store'


class UserList extends React.Component {
  handleButton = () => {
    this.props.store.user.setList({
      data: [],
      page: 1,
      total: 0,
    })
  }

  render() {
    return (
      <Template>
        {this.props.store.user.list.page}
        list
        <Button onClick={this.handleButton}>Do it</Button>
      </Template>
    )
  }
}


UserList.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      page: PropTypes.string,
    }).isRequired,
  }).isRequired,
}


export default withStore(UserList)
