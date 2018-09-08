import { Component } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux';
import actions from './actions'


const mapStateToProps = (state) => ({
  error: state.me.error,
  status: state.me.status,
  pending: state.me.pending,
  refreshError: state.refresh.error,
  refreshStatus: state.refresh.status,
  refreshPending: state.refresh.pending,
})


class ProtectedComponent extends Component {
  state = {
    refreshRequested: false,
  }

  componentWillMount() {
    this.props.requestMe()
	}

  componentWillReceiveProps(nextProps) {
    if (nextProps.status === 200) {
      return
    } else if (nextProps.refreshStatus === 401) {
      this.props.requestRefreshReset()
      this.context.router.history.push('/landing')
    } else if (nextProps.refreshStatus === 200) {
      this.setState({ refreshRequested: false })
      this.props.requestMe()
    } else if (nextProps.status === 401) {
      if (!this.state.refreshRequested) {
        this.setState({ refreshRequested: true })
        this.props.requestRefresh()
      }
    }
  }

  render() {
    return null
  }
}


ProtectedComponent.propTypes = {
  status: PropTypes.number,
}


ProtectedComponent.contextTypes = {
	router: PropTypes.object.isRequired,
}


export default connect(mapStateToProps, actions)(ProtectedComponent)
