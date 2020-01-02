import React from 'react'
import Template from '../../templates/default/detail'

// Components
import {
  RoleList,
  UserList,
} from '../../components'

import styles from './styles'

const Dashboard = () => (
  <Template secure style={styles.template}>
    <div style={styles.root}>
      <RoleList />
      <UserList />
    </div>
  </Template>
)

export default Dashboard
