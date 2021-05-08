import React from 'react'
import { observer } from 'mobx-react'
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

import { store } from '../../store'
import { errors } from '../../utils'
import styles from './styles'

class UserList extends React.Component {
  constructor(props) {
    super(props)
    this.fetch()
  }

  fetch = async () => {
    const { notification, user } = store
    const response = await user.fetchAll(this.props.match.params.page)
    if (!response.ok) {
      const error = errors(response)
      notification.show(error.message)
    }
  }

  handleUserActive = (user) => () => {
    store.user.edit(user.id, { active: !user.active })
  }

  render() {
    const page = Number(this.props.match.params.page || '0')
    const previous =
      page !== 0 ? (
        <Link to={page !== 1 ? `/users/${page - 1}` : '/users'}>
          <Button variant="outlined">&lt;</Button>
        </Link>
      ) : (
        <Button variant="outlined" disabled>
          &lt;
        </Button>
      )
    const next =
      page < store.user.list.pages - 1 ? (
        <Link to={`/users/${page + 1}`}>
          <Button variant="outlined">&gt;</Button>
        </Link>
      ) : (
        <Button variant="outlined" disabled>
          &gt;
        </Button>
      )
    const userList = store.user.list.data.map((user) => (
      <List style={styles.item} key={user.id}>
        <ListItem dense button>
          <Avatar style={styles.avatar}>{user.id}</Avatar>
          <ListItemText primary={user.email} />
          <ListItemSecondaryAction>
            <Switch
              onChange={this.handleUserActive(user)}
              checked={user.active}
              disabled={user.id === store.profile.detail.id}
            />
            <Link to={`/user/${user.id}`}>
              <Button style={styles.details} variant="outlined" color="primary">
                Details
              </Button>
            </Link>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    ))

    return (
      <Paper style={styles.root}>
        {userList}
        <div style={styles.center}>
          {previous}
          <Avatar style={styles.page} data-id="page">
            {String(page)}
          </Avatar>
          {next}
        </div>
      </Paper>
    )
  }
}

export default observer(UserList)
