import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import Button from '@material-ui/core/Button'
import Template from 'templates/default'
import store from 'store'


class Landing extends Component {
  componentWillMount() {
    this.props.store.title.title = 'Landing'
  }

  handleClick = () => {
    this.props.store.todo.addTodo('cvrc')
  }

  render() {
    return (
      <Template>
        <Button variant="contained" onClick={this.handleClick}>
          Landing
        </Button>
        <span>{this.props.store.todo.todos.length}</span>
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
