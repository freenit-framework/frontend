import React from 'react'
import PropTypes from 'prop-types'

// Components
import {
  Button,
  Snackbar,
} from '@material-ui/core'

import { Protected } from '../../components'
import { withStore } from '../../store'

const EmptyTemplate = props => {
  const { notification } = props.store

  return (
    <div style={props.style}>
      <Protected secure={props.secure} />
      {props.children}
      <Snackbar
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={notification.detail.show}
        onClose={notification.close}
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

EmptyTemplate.propTypes = {
  children: PropTypes.node,
  secure: PropTypes.bool,
  store: PropTypes.shape({
    notification: PropTypes.shape({
      close: PropTypes.func.isRequired,
      detail: PropTypes.shape({
        message: PropTypes.string.isRequired,
        show: PropTypes.bool.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  style: PropTypes.shape({}),
}

EmptyTemplate.defaultProps = {
  children: null,
  secure: false,
  style: {
    padding: 20,
  },
}

export default withStore(EmptyTemplate)
