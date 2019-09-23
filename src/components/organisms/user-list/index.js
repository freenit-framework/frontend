import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { withStore } from 'store'

// Components
import Badge from '@material-ui/core/Badge'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

import styles from './styles'


class UserList extends React.Component {
  constructor(props) {
    super(props)
    props.store.user.fetchAll()
  }

  render() {
    return (
      <Badge
        badgeContent={this.props.store.user.list.total}
        color="primary"
      >
        <Card style={styles.card}>
          <CardContent>
            <Typography variant="h5">
              Users
            </Typography>
            <Typography color="textSecondary">
              All users
            </Typography>
          </CardContent>
          <CardActions>
            <Link to="/users">
              <Button variant="outlined" size="small">Explore</Button>
            </Link>
          </CardActions>
        </Card>
      </Badge>
    )
  }
}


UserList.propTypes = {
  store: PropTypes.shape({
    user: PropTypes.shape({
      list: PropTypes.shape({
        total: PropTypes.number.isRequired,
      }).isRequired,
      fetchAll: PropTypes.func.isRequired,
    }).isRequired
  }).isRequired
}


export default withStore(UserList)
