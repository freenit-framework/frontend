import React from 'react'

import {
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Switch,
} from '@material-ui/core'

import { withStore } from '../../store'
import styles from './styles'


class UserDetail extends React.Component {
  constructor(props) {
    super(props)
    this.fetch()
  }

  fetch = async () => {
    const { store } = this.props
    const [user, roles] = await Promise.all([
      store.user.fetch(this.props.match.params.id),
      store.role.fetchAll(),
    ])
    if (!user.ok) { store.notification.show('User error') }
    if (!roles.ok) { store.notification.show('Role error') }
  }

  handleRoleActive = role => (event, value) => {
    if (value) { this.props.store.user.assign(role.id) }
    else { this.props.store.user.deassign(role.id) }
  }

  render() {
    let roleList
    const { role, user } = this.props.store
    if (role.list.data.length === 0) { roleList = null }
    else {
      roleList = role.list.data.map(role => {
        const activated = user.detail.roles.filter(
          userRole => userRole.id === role.id,
        ).length > 0

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
        <List>
          {roleList}
        </List>
      </Paper>
    )
  }
}


export default withStore(UserDetail)
