import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import Button from '@material-ui/core/Button'
import Template from 'templates/default'
import { isLoggedIn } from 'utils'


export default class Home extends Component {
	componentWillMount() {
		if (!isLoggedIn()) {
			this.context.router.history.push('/landing')
		}
	}

  render() {
    return (
      <Template>
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
