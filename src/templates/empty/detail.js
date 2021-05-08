import React from 'react'
import { observer } from 'mobx-react'
import { Button, Snackbar } from '@material-ui/core'
import { store } from '../../store'

class EmptyTemplate extends React.Component {
  render() {
    const { auth, history, notification } = store
    if (auth.initialized && this.props.secure && !auth.authenticated()) {
      history.push('/')
      return null
    }
    return (
      <div style={this.props.style}>
        {this.props.children}
        <Snackbar
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={Boolean(notification.message)}
          onClose={notification.close}
          message={notification.message}
          action={
            <Button color="secondary" size="small" onClick={notification.close}>
              CLOSE
            </Button>
          }
        />
      </div>
    )
  }
}

EmptyTemplate.defaultProps = {
  children: null,
  secure: false,
  style: { padding: 20 },
}

export default observer(EmptyTemplate)
