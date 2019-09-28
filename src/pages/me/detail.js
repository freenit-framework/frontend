import React from 'react'
import PropTypes from 'prop-types'

// Components
import {
  Paper,
} from '@material-ui/core'

import NoPage from 'pages/nopage'
import Template from 'templates/default'
import styles from './styles'


class Me extends React.Component {
  constructor(props) {
    super(props)
    props.store.me.fetch()
  }

  render() {
    return this.props.store.me.detail.admin
      ? (
        <Template style={{}}>
          <Paper style={styles.root}>
            <h1 style={styles.h1.small}>
              {this.props.store.me.detail.email}
            </h1>
          </Paper>
        </Template>
      )
      : <NoPage />
  }
}


Me.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
}


export default Me
