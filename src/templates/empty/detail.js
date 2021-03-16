import React from 'react'
import { Button, Snackbar } from '@material-ui/core'
import { auth } from '../../auth'
import { withStore } from '../../store'


const EmptyTemplate = props => {
  const { history, notification } = props.store
  if (props.secure && !auth.authenticated()) {
    history.push('/')
    return null
  }
  return (
    <div style={props.style}>
      {props.children}
      <Snackbar
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={Boolean(notification.message)}
        onClose={notification.close}
        message={notification.message}
        action={(
          <Button color="secondary" size="small" onClick={notification.close}>
            CLOSE
          </Button>
        )}
      />
    </div>
  )
}


EmptyTemplate.defaultProps = {
  children: null,
  secure: false,
  style: { padding: 20 },
}


export default withStore(EmptyTemplate)
