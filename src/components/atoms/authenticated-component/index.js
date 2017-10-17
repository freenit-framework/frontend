import React from 'react';
import PropTypes from 'prop-types';
import { isLoggedIn } from '../../../utils';


class AuthenticatedComponent extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  componentWillMount() {
    if (!isLoggedIn()) {
      this.context.router.history.push('/landing');
    }
  }

  render() {
    return null;
  }
}


export default AuthenticatedComponent;
