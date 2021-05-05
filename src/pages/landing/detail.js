import React from 'react'
import { observer } from 'mobx-react'
import { withTheme } from '@material-ui/core/styles'
import { Paper } from '@material-ui/core'

import getStyles from './styles'

class Landing extends React.Component {
  render() {
    const height = this.props.height || 'calc(100vh - 64px - 40px)'
    const styles = getStyles(this.props.theme, height)
    return (
      <Paper style={styles.root}>
        <h1>Freenit Framework</h1>
        <div style={styles.small}>Startkit for fast React development</div>
        <Paper style={styles.freenit}>Freenit</Paper>
      </Paper>
    )
  }
}

export default withTheme(observer(Landing))
