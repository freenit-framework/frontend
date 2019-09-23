import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import ProtectedComponent from 'components/atoms/protected'
import { withStore } from 'store'


class EmptyTemplate extends Component {
  render() {
    const { notification } = this.props.store
    return (
      <div style={this.props.style}>
        <ProtectedComponent secure={this.props.secure} />
        {this.props.children}
        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={notification.detail.show}
          onClose={this.handleClose}
          message={notification.detail.message}
          action={(
            <Button
              color="secondary"
              size="small"
              onClick={notification.close}
            >
              CLOSE
            </Button>
          )}
        />
      </div>
    )
  }
}


EmptyTemplate.propTypes = {
  children: PropTypes.node,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  secure: PropTypes.bool,
  store: PropTypes.shape({}).isRequired,
  style: PropTypes.shape({}),
}


EmptyTemplate.defaultProps = {
  style: {
    padding: 20,
  },
}


export default withStore(EmptyTemplate)
