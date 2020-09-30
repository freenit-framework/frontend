import React from 'react'
import PropTypes from 'prop-types'

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

import { withStore } from '../../store'
import styles from './styles'

class RoleDetail extends React.Component {
  componentDidMount = async () => {
    const [roleResponse, userResponse] = await Promise.all([
      this.props.store.role.fetch(this.props.match.params.id),
      this.props.store.user.fetchAll(),
    ])
    const { notification } = this.props.store
    if (!roleResponse.ok) {
      notification.show(roleResponse.error)
    }
    if (!userResponse.ok) {
      notification.show(userResponse.error)
    }
  }

  handleAdmin = () => {
    this.props.store.role.edit(
      this.props.match.params.id,
      { admin: !this.props.store.role.detail.admin },
    )
  }

  handleUserActive = user => (event, value) => {
    if (value) {
      this.props.store.role.assign(user.id)
    } else {
      this.props.store.role.deassign(user.id)
    }
  }

  render() {
    let userList
    const { role, user } = this.props.store
    if (user.list.data.length === 0) {
      userList = null
    } else {
      userList = user.list.data.map(user => {
        const activated = role.detail.users.filter(
          roleUser => roleUser.id === user.id,
        ).length > 0

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
        <h1 style={styles.h1.small}>
          {role.detail.name}
        </h1>
        <List>
          {userList}
        </List>
      </Paper>
    )
  }
}

RoleDetail.propTypes = {
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
      assign: PropTypes.func.isRequired,
      deassign: PropTypes.func.isRequired,
      detail: PropTypes.shape({
        admin: PropTypes.bool,
        name: PropTypes.string.isRequired,
        users: PropTypes.array.isRequired,
      }).isRequired,
      edit: PropTypes.func.isRequired,
      fetch: PropTypes.func.isRequired,
    }).isRequired,
    user: PropTypes.shape({
      id: PropTypes.number.isRequired,
      email: PropTypes.string.isRequired,
      list: PropTypes.shape({
        data: PropTypes.shape({
          length: PropTypes.number.isRequired,
          map: PropTypes.func.isRequired,
        }).isRequired,
      }).isRequired,
      fetchAll: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
}

export default withStore(RoleDetail)
