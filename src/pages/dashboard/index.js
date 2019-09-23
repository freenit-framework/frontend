import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTheme } from '@material-ui/core/styles'
import Template from 'templates/default'
import UserList from 'components/organisms/user-list'
import styles from './styles'


class Dashboard extends Component {
  render() {
    return (
      <Template secure style={styles.template}>
        <div style={styles.root}>
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
