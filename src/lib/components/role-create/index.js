import React from 'react'
import PropTypes from 'prop-types'

// Components
import {
  Button,
  Dialog,
  DialogTitle,
  TextField,
} from '@material-ui/core'

import { withStore } from '../../store'
import styles from './styles'

class RoleCreate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
    }
  }

  handleName = event => {
    this.setState({ name: event.target.value })
  }

  handleSubmit = async event => {
    event.preventDefault()
    const { name } = this.state
    const { role, notification } = this.props.store
    const response = await role.create({ name })
    if (response.ok) {
      notification.show('Role created')
    } else {
      notification.show('Error')
    }
    this.props.close()
  }

  render() {
    return (
      <Dialog
        onClose={this.props.close}
        open={this.props.open}
      >
        <DialogTitle>Create new role</DialogTitle>
        <form onSubmit={this.handleSubmit} style={styles.form}>
          <TextField
            autoFocus
            required
            fullWidth
            label="Name"
            variant="outlined"
            value={this.state.name}
            onChange={this.handleName}
          />
          <Button
            fullWidth
            type="submit"
            color="primary"
            variant="contained"
          >
            Create
          </Button>
          <Button
            fullWidth
            color="secondary"
            variant="outlined"
            onClick={this.props.close}
          >
            Cancel
          </Button>
        </form>
      </Dialog>
    )
  }
}

RoleCreate.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func.isRequired,
  store: PropTypes.shape({
    notification: PropTypes.shape({
      show: PropTypes.func.isRequired,
    }).isRequired,
    role: PropTypes.shape({
      detail: PropTypes.shape({
        admin: PropTypes.bool,
        name: PropTypes.string.isRequired,
        users: PropTypes.array.isRequired,
      }).isRequired,
      create: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
}

RoleCreate.defaultProps = {
  open: false,
}

export default withStore(RoleCreate)
