import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import Template from 'templates/default'
import store from 'store'


class Landing extends Component {
  componentWillMount() {
    this.props.store.title.title = 'Landing'
  }

  render() {
    return (
      <Template>
        Landing Page
      </Template>
    )
  }
}


Landing.propTypes = {
  store: PropTypes.shape({
    title: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }).isRequired,
    todo: PropTypes.shape({
      addTodo: PropTypes.func.isRequired,
      todos: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    }).isRequired,
  }),
}


export default observer((props) => <Landing {...props} store={store} />)
