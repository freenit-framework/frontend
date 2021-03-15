import React from 'react'
import { Button, Snackbar } from '@material-ui/core'
import { withStore } from '../../store'


const EmptyTemplate = props => {
  const { notification } = props.store
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
