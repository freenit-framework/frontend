import React from 'react'

// Components
import { RoleList, UserList } from '../../components'

import styles from './styles'

const Dashboard = () => (
  <div style={styles.root}>
    <RoleList />
    <UserList />
  </div>
)

export default Dashboard
