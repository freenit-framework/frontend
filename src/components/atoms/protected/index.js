import React, { Component } from 'react'
import { PropTypes } from 'prop-types'


const mapStateToProps = (state) => ({
  error: state.login.error,
  status: state.login.status,
})


class Protected extends Component {
	componentWillMount() {
    this.props.me()
	}

  componentWillReceiveProps(nextProps) {
    if (nextProps === 403) {
      this.context.router.history.push('/login')
    }
  }
}


Protected.propTypes = {
  status: PropTypes.number,
}


Protected.contextTypes = {
	router: PropTypes.object.isRequired,
}


export default connect(mapStateToProps, actions)(Protected)
