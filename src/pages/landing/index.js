import React from 'react';
import { connect } from 'react-redux';
import AppBar from 'material-ui/AppBar';


const mapStateToProps = (state) => ({
  theme: state.theme.theme,
});


const Landing = React.createClass({
  propTypes: {
    theme: React.PropTypes.object.isRequired,
  },

  contextTypes: {
    router: React.PropTypes.object.isRequired,
  },

  handleLogin() {
    this.context.router.push('/login');
  },

  render() {
    return (
      <div>
        <AppBar title="MyApp" />
        Landing Page
      </div>
    );
  },
});


export default connect(mapStateToProps)(Landing);
