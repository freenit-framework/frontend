import React from 'react'
import PropTypes from 'prop-types'
import styles from './styles'


class ProtectedComponent extends React.Component {
  render() {
    return (
      <div style={styles.root}>
      </div>
    )
  }
}


ProtectedComponent.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  secure: PropTypes.bool,
}


export default ProtectedComponent
