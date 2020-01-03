import React from 'react'
import PropTypes from 'prop-types'

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
import Template from '../../templates/default/detail'
import styles from './styles'

class UserDetail extends React.Component {
  constructor(props) {
    super(props)
    this.fetch()
  }

  fetch = async () => {
    const { store } = this.props
    const [users, roles] = await Promise.all([
      store.user.fetch(this.props.match.params.id),
      store.role.fetchAll(),
    ])
    if (!users.ok) {
      store.notification.show('User error')
    }
    if (!roles.ok) {
      store.notification.show('Role error')
    }
  }

  handleRoleActive = role => (event, value) => {
    if (value) {
      this.props.store.user.assign(role.id)
    } else {
      this.props.store.user.deassign(role.id)
    }
  }

  render() {
    let roleList
    const { role, user } = this.props.store
    if (role.list.data.length === 0) {
      roleList = null
    } else {
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
      <Template secure style={{}}>
        <Paper style={styles.root}>
          email: &nbsp;
          <span data-id="email">{user.detail.email}</span>
          <List>
            {roleList}
          </List>
        </Paper>
      </Template>
    )
  }
}

UserDetail.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  store: PropTypes.shape({
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
      assign: PropTypes.func.isRequired,
      deassign: PropTypes.func.isRequired,
      detail: PropTypes.shape({
        email: PropTypes.string.isRequired,
        roles: PropTypes.array,
      }).isRequired,
      fetch: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
}

export default withStore(UserDetail)
