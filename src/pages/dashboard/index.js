import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { withTheme } from '@material-ui/core/styles'
import Template from 'templates/default'
import store from 'store'
import getStyles from './styles'


class Dashboard extends Component {
  componentWillMount() {
    this.props.store.title.title = 'Dashboard'
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
  store: PropTypes.shape({
    title: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  theme: PropTypes.shape().isRequired,
}


Dashboard.defaultProps = {
  secure: true,
}


export default withTheme()(observer((props) => <Dashboard {...props} store={store} />))
