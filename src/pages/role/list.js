import React from 'react'
import PropTypes from 'prop-types'
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

import {
  RoleCreate,
} from '../../components'
import { withStore } from '../../store'
import styles from './styles'

class RoleList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
    }
    const page = Number(props.match.params.page || '0')
    props.store.role.fetchAll(page)
  }

  componentDidUpdate = prevProps => {
    const oldPage = Number(prevProps.match.params.page || '0')
    const newPage = Number(this.props.match.params.page || '0')
    if (oldPage !== newPage) {
      this.props.store.role.fetchAll(newPage)
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
    const previous = page !== 0
      ? (
        <Link to={page !== 1 ? `/roles/${page - 1}` : '/roles'}>
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
    const next = page < this.props.store.role.list.pages - 1
      ? (
        <Link to={`/roles/${page + 1}`}>
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
    const roleList = this.props.store.role.list.data.map(role => (
      <List style={styles.item} key={role.id}>
        <ListItem dense button>
          <Avatar style={styles.avatar} data-id="avatar">{role.id}</Avatar>
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
        <RoleCreate
          open={this.state.open}
          close={this.handleClose}
        />
        <Paper style={styles.root}>
          {roleList}
          <Fab color="primary" onClick={this.handleAdd} data-id="add">
            <AddIcon />
          </Fab>
          <div style={styles.center}>
            {previous}
            <Avatar style={styles.page} data-id="page">{String(page)}</Avatar>
            {next}
          </div>
        </Paper>
      </div>
    )
  }
}

RoleList.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      page: PropTypes.string,
    }).isRequired,
  }).isRequired,
  store: PropTypes.shape({
    role: PropTypes.shape({
      fetchAll: PropTypes.func.isRequired,
      list: PropTypes.shape({
        data: PropTypes.array.isRequired,
        pages: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
    notification: PropTypes.shape({
      show: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
}

export default withStore(RoleList)
