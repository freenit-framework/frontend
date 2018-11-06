import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { withTheme } from '@material-ui/core/styles'
import Template from 'templates/default'
import titleActions from 'templates/default/actions'
import getStyles from './styles'


const mapStateToProps = () => ({})


class Dashboard extends Component {
  componentWillMount() {
    this.props.requestTitle('Dashboard')
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
  requestTitle: PropTypes.func.isRequired,
}


Dashboard.defaultProps = {
  secure: true,
}


export default connect(mapStateToProps, titleActions)(
  withTheme()(Dashboard),
)
