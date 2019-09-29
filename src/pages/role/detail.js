import React from 'react'
import PropTypes from 'prop-types'
import { withStore } from 'store'

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

import NoPage from 'pages/nopage'
import Template from 'templates/default'
import styles from './styles'


class RoleDetail extends React.Component {
  constructor(props) {
    super(props)
    props.store.role.fetch(this.props.match.params.id)
    props.store.user.fetchAll()
  }

  handleAdmin = () => {
    this.props.store.role.edit(
      this.props.match.params.id,
      { admin: !this.props.store.role.detail.admin },
    )
  }

  handleUserActive = (user) => (event, value) => {
    if (value) {
      this.props.store.role.assign(user.id)
    } else {
      this.props.store.role.deassign(user.id)
    }
  }

  render() {
    let userList
    const { me, role, user } = this.props.store
    if (user.list.data.length === 0) {
      userList = null
    } else if (role.detail.users.length === 0) {
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
    return me.detail.admin
      ? (
        <Template style={{}}>
          <Paper style={styles.root}>
            <h1 style={styles.h1.small}>
              {role.detail.name}
            </h1>
            <List>
              {userList}
            </List>
          </Paper>
        </Template>
      )
      : <NoPage secure />
  }
}


RoleDetail.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
}


export default withStore(RoleDetail)

