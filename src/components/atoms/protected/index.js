import { Component } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux';
import actions from './actions'


const mapStateToProps = (state) => ({
  error: state.me.error,
  status: state.me.status,
})


class ProtectedComponent extends Component {
	componentWillMount() {
    this.props.requestMe()
	}

  componentWillReceiveProps(nextProps) {
    if (nextProps.status === 403) {
      this.context.router.history.push('/login')
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
