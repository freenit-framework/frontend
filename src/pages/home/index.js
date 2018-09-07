import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import Button from '@material-ui/core/Button'
import Template from 'templates/default'
import ProtectedComponent from 'components/atoms/protected'


export default class Home extends Component {
  render() {
    return (
      <Template>
        <ProtectedComponent />
        <Button variant="contained">
          Home
        </Button>
      </Template>
    )
  }
}


Home.contextTypes = {
	router: PropTypes.object.isRequired,
}
