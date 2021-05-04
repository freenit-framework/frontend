import React from 'react'
import { observer } from 'mobx-react'
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

@observer
class UserList extends React.Component {
  constructor(props) {
    super(props)
    store.user.fetchAll()
  }

  render() {
    return (
      <Badge color="primary" badgeContent={store.user.list.total}>
        <Card style={styles.card}>
          <CardContent>
            <Typography variant="h5" data-id="users">
              Users
            </Typography>
            <Typography color="textSecondary">All users</Typography>
          </CardContent>
          <CardActions>
            <Link to="/users">
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

export default UserList
