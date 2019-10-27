import React from 'react'
import { withStore } from 'store'

// Components
import {
  Paper,
} from '@material-ui/core'

import { errorResponse } from 'utils'
import Template from 'templates/default/detail'
import styles from './styles'


class Me extends React.Component {
  constructor(props) {
    super(props)
    this.fetch()
  }

  fetch = async () => {
    const { store } = this.props
    const response = await store.me.fetch()
    if (!response.ok) {
      const error = errorResponse(response)
      store.notification.show(error.message)
    }
  }

  render() {
    const { me } = this.props.store
    return (
      <Template style={{}}>
        <Paper style={styles.root}>
          <h1 style={styles.h1.small}>
            {me.detail.email}
          </h1>
        </Paper>
      </Template>
    )
  }
}


export default withStore(Me)
