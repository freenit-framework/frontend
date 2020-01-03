import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

// Components
import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Switch,
} from '@material-ui/core'

import Template from '../../templates/default/detail'
import { withStore } from '../../store'
import { errors } from '../../utils'
import styles from './styles'

class UserList extends React.Component {
  constructor(props) {
    super(props)
    this.fetch()
  }

  fetch = async () => {
    const { notification, user } = this.props.store
    const response = await user.fetchAll(this.props.match.params.page)
    if (!response.ok) {
      const error = errors(response)
      notification.show(error.message)
    }
  }

  handleUserActive = user => () => {
    this.props.store.user.edit(user.id, { active: !user.active })
  }

  render() {
    const page = Number(this.props.match.params.page || '0')
    const previous = page !== 0
      ? (
        <Link to={page !== 1 ? `/users/${page - 1}` : '/users'}>
          <Button variant="outlined">
            &lt;
          </Button>
        </Link>
      )
      : (
        <Button variant="outlined" disabled>
          &lt;
        </Button>
      )
    const next = page < this.props.store.user.list.pages - 1
      ? (
        <Link to={`/users/${page + 1}`}>
          <Button variant="outlined">
            &gt;
          </Button>
        </Link>
      )
      : (
        <Button variant="outlined" disabled>
          &gt;
        </Button>
      )
    const userList = this.props.store.user.list.data.map(user => (
      <List style={styles.item} key={user.id}>
        <ListItem dense button>
          <Avatar style={styles.avatar}>{user.id}</Avatar>
          <ListItemText primary={user.email} />
          <ListItemSecondaryAction>
            <Switch
              onChange={this.handleUserActive(user)}
              checked={user.active}
              disabled={user.id === this.props.store.me.detail.id}
            />
            <Link to={`/user/${user.id}`}>
              <Button
                style={styles.details}
                variant="outlined"
                color="primary"
              >
                Details
              </Button>
            </Link>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    ))

    return (
      <Template secure style={{}}>
        <Paper style={styles.root}>
          {userList}
          <div style={styles.center}>
            {previous}
            <Avatar style={styles.page} data-id="page">{String(page)}</Avatar>
            {next}
          </div>
        </Paper>
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
  store: PropTypes.shape({
    me: PropTypes.shape({
      detail: PropTypes.shape({
        id: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
    notification: PropTypes.shape({
      show: PropTypes.func.isRequired,
    }).isRequired,
    role: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      fetchAll: PropTypes.func.isRequired,
      list: PropTypes.shape({
        data: PropTypes.array,
      }).isRequired,
    }).isRequired,
    user: PropTypes.shape({
      edit: PropTypes.func.isRequired,
      fetchAll: PropTypes.func.isRequired,
      list: PropTypes.shape({
        data: PropTypes.array.isRequired,
        pages: PropTypes.number.isRequired,
      }).isRequired,
      fetch: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
}

export default withStore(UserList)
