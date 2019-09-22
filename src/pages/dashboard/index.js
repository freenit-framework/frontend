import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTheme } from '@material-ui/core/styles'
import Template from 'templates/default'
import getStyles from './styles'


class Dashboard extends Component {
  render() {
    const styles = getStyles(this.props.theme, 4)
    return (
      <Template secure>
        <div style={styles.root}>
          Dashboard
        </div>
      </Template>
    )
  }
}


Dashboard.propTypes = {
  secure: PropTypes.bool,
  theme: PropTypes.shape().isRequired,
}


export default withTheme(Dashboard)
