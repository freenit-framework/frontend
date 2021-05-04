import React from 'react'
import { observer } from 'mobx-react'

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

@observer
class UserDetail extends React.Component {
  constructor(props) {
    super(props)
    this.fetch()
  }

  fetch = async () => {
    const [user, roles] = await Promise.all([
      store.user.fetch(this.props.match.params.id),
      store.role.fetchAll(),
    ])
    if (!user.ok) {
      store.notification.show('User error')
    }
    if (!roles.ok) {
      store.notification.show('Role error')
    }
  }

  handleRoleActive = (role) => (event, value) => {
    if (value) {
      store.user.assign(role.id)
    } else {
      store.user.deassign(role.id)
    }
  }

  render() {
    let roleList
    const { role, user } = store
    if (role.list.data.length === 0) {
      roleList = null
    } else {
      roleList = role.list.data.map((role) => {
        const activated =
          user.detail.roles.filter((userRole) => userRole.id === role.id)
            .length > 0

        return (
          <ListItem key={role.id} style={styles.item} dense button>
            <Avatar style={styles.avatar}>{role.id}</Avatar>
            <ListItemText primary={role.name} />
            <ListItemSecondaryAction>
              <Switch
                onChange={this.handleRoleActive(role)}
                checked={activated}
              />
            </ListItemSecondaryAction>
          </ListItem>
        )
      })
    }
    return (
      <Paper style={styles.root}>
        email: &nbsp;
        <span data-id="email">{user.detail.email}</span>
        <List>{roleList}</List>
      </Paper>
    )
  }
}

export default UserDetail
