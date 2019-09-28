import React from 'react'
import PropTypes from 'prop-types'
import { withTheme } from '@material-ui/core/styles'
import Template from 'templates/default'

// Components
import RoleList from 'components/organisms/role-list'
import UserList from 'components/organisms/user-list'

import styles from './styles'


class Dashboard extends React.Component {
  render() {
    return (
      <Template secure style={styles.template}>
        <div style={styles.root}>
          <RoleList />
          <UserList />
        </div>
      </Template>
    )
  }
}


Dashboard.propTypes = {
  secure: PropTypes.bool,
}


export default withTheme(Dashboard)
