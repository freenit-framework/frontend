import React from 'react'
import { observer } from 'mobx-react'
import { Link } from 'react-router-dom'

// Components
import {
  Avatar,
  Button,
  Fab,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
} from '@material-ui/core'

// Icons
import AddIcon from '@material-ui/icons/Add'

import { RoleCreate } from '../../components'
import { store } from '../../store'
import styles from './styles'

@observer
class RoleList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }
    const page = Number(props.match.params.page || '0')
    store.role.fetchAll(page)
  }

  componentDidUpdate = (prevProps) => {
    const oldPage = Number(prevProps.match.params.page || '0')
    const newPage = Number(this.props.match.params.page || '0')
    if (oldPage !== newPage) {
      store.role.fetchAll(newPage)
    }
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  handleAdd = () => {
    this.setState({ open: true })
  }

  render() {
    const page = Number(this.props.match.params.page || '0')
    const previous =
      page !== 0 ? (
        <Link to={page !== 1 ? `/roles/${page - 1}` : '/roles'}>
          <Button variant="outlined">&lt;</Button>
        </Link>
      ) : (
        <Button variant="outlined" disabled>
          &lt;
        </Button>
      )
    const next =
      page < store.role.list.pages - 1 ? (
        <Link to={`/roles/${page + 1}`}>
          <Button variant="outlined">&gt;</Button>
        </Link>
      ) : (
        <Button variant="outlined" disabled>
          &gt;
        </Button>
      )
    const roleList = store.role.list.data.map((role) => (
      <List style={styles.item} key={role.id}>
        <ListItem dense button>
          <Avatar style={styles.avatar} data-id="avatar">
            {role.id}
          </Avatar>
          <ListItemText primary={role.name} />
          <ListItemSecondaryAction>
            <Link to={`/role/${role.id}`}>
              <Button style={styles.details} variant="outlined" color="primary">
                Details
              </Button>
            </Link>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    ))

    return (
      <div>
        <RoleCreate open={this.state.open} close={this.handleClose} />
        <Paper style={styles.root}>
          {roleList}
          <Fab color="primary" onClick={this.handleAdd} data-id="add">
            <AddIcon />
          </Fab>
          <div style={styles.center}>
            {previous}
            <Avatar style={styles.page} data-id="page">
              {String(page)}
            </Avatar>
            {next}
          </div>
        </Paper>
      </div>
    )
  }
}

export default RoleList
