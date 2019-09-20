import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTheme } from '@material-ui/core/styles'
import Template from 'templates/default'
import store from 'store'
import getStyles from './styles'


class Dashboard extends Component {
  componentWillMount() {
    store.title.title = 'Dashboard'
  }

  render() {
    const styles = getStyles(this.props.theme, 4)
    return (
      <Template secure={this.props.secure}>
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


Dashboard.defaultProps = {
  secure: true,
}


export default withTheme(Dashboard)
