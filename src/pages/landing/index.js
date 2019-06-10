import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import Template from 'templates/default'
import store from 'store'


@observer
class Landing extends Component {
  componentWillMount() {
    store.title.title = 'Landing'
  }

  render() {
    return (
      <Template>
        Landing Page
      </Template>
    )
  }
}


export default Landing
