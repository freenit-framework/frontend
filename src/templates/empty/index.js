import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import ProtectedComponent from 'components/atoms/protected'
import store from 'store'
import styles from './styles'


class EmptyTemplate extends Component {
  handleClose = () => {
    const { error } = this.props.store
    error.open = false
  }

  render() {
    const Secure = this.props.secure ? <ProtectedComponent /> : <div />
    const { error } = this.props.store
    return (
      <div style={styles.root}>
        {Secure}
        {this.props.children}
        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={error.open}
          onClose={this.handleClose}
          message={error.message}
          action={(
            <Button
              color="secondary"
              size="small"
              onClick={this.handleClose}
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
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape()]),
  secure: PropTypes.bool,
  store: PropTypes.shape({
    error: PropTypes.shape({
      message: PropTypes.string.isRequired,
      open: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
}


export default observer((props) => <EmptyTemplate {...props} store={store} />)
