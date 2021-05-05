import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

// Components
import {
  Badge,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from '@material-ui/core'

import { store } from '../../store'
import styles from './styles'

class RoleList extends React.Component {
  constructor(props) {
    super(props)
    store.role.fetchAll()
  }

  render() {
    return (
      <Badge color="primary" badgeContent={store.role.list.total}>
        <Card style={styles.card}>
          <CardContent>
            <Typography variant="h5" data-id="roles">
              Roles
            </Typography>
            <Typography color="textSecondary">All roles</Typography>
          </CardContent>
          <CardActions>
            <Link to="/roles">
              <Button variant="outlined" size="small">
                Explore
              </Button>
            </Link>
          </CardActions>
        </Card>
      </Badge>
    )
  }
}

export default observer(RoleList)
