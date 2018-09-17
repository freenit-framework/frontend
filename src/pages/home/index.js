import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import Template from 'templates/default'
import errorActions from 'templates/empty/actions'


const mapStateToProps = (state) => ({})


class Home extends Component {
  render() {
    return (
      <Template secure>
        <Button variant="contained" onClick={() => this.props.requestError('Error message')}>
          Display Error
        </Button>
      </Template>
    )
  }
}


Home.contextTypes = {
	router: PropTypes.object.isRequired,
}


export default connect(mapStateToProps, errorActions)(Home)
