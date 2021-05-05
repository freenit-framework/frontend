import React from 'react'
import { observer } from 'mobx-react'

// Components
import {
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Switch,
} from '@material-ui/core'

import { store } from '../../store'
import styles from './styles'

class RoleDetail extends React.Component {
  componentDidMount = async () => {
    const [roleResponse, userResponse] = await Promise.all([
      store.role.fetch(this.props.match.params.id),
      store.user.fetchAll(),
    ])
    const { notification } = store
    if (!roleResponse.ok) {
      notification.show(roleResponse.error)
    }
    if (!userResponse.ok) {
      notification.show(userResponse.error)
    }
  }

  handleAdmin = () => {
    store.role.edit(this.props.match.params.id, {
      admin: !store.role.detail.admin,
    })
  }

  handleUserActive = (user) => (event, value) => {
    if (value) {
      store.role.assign(user.id)
    } else {
      store.role.deassign(user.id)
    }
  }

  render() {
    let userList
    const { role, user } = store
    if (user.list.data.length === 0) {
      userList = null
    } else {
      userList = user.list.data.map((user) => {
        const activated =
          role.detail.users.filter((roleUser) => roleUser.id === user.id)
            .length > 0

        return (
          <ListItem key={user.id} style={styles.item} dense button>
            <Avatar style={styles.avatar}>{user.id}</Avatar>
            <ListItemText primary={user.email} />
            <ListItemSecondaryAction>
              <Switch
                onChange={this.handleUserActive(user)}
                checked={activated}
              />
            </ListItemSecondaryAction>
          </ListItem>
        )
      })
    }

    return (
      <Paper style={styles.root}>
        <h1 style={styles.h1.small}>{role.detail.name}</h1>
        <List>{userList}</List>
      </Paper>
    )
  }
}

export default observer(RoleDetail)
