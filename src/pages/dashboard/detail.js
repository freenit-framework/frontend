import React from 'react'
import { withTheme } from '@material-ui/core/styles'
import Template from 'templates/default/detail'

// Components
import {
  RoleList,
  UserList,
} from 'components'

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


export default withTheme(Dashboard)
