import React from 'react';
import PropTypes from 'prop-types';
import Template from '../../templates/default';
import getStyles from './styles';


class NotFound extends React.Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  render() {
    const styles = getStyles(this.context.muiTheme);
    return (
      <Template>
        <div style={styles.center}>
          <h1>Requested Page Not Found</h1>
        </div>
      </Template>
    );
  }
}

export default NotFound;
