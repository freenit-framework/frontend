import React from 'react';
import { connect } from 'react-redux';
import radium from 'radium';
import { isLoggedIn } from '../../utils';
import actions from './actions';


const mapStateToProps = (state) => ({
  theme: state.theme.theme,
});


const Home = React.createClass({
  propTypes: {
    theme: React.PropTypes.object,
    get: React.PropTypes.func.isRequired,
    reset: React.PropTypes.func.isRequired,
  },

  contextTypes: {
    router: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      images: [],
    };
  },

  componentWillMount() {
    if (!isLoggedIn()) {
      this.context.router.push('/landing');
    } else {
      this.props.get();
    }
  },

  componentWillUnmount() {
    this.props.reset();
  },

  render() {
    return (<div>Home Page</div>);
  },
});


const RadiumHome = radium(Home);
export default connect(mapStateToProps, actions)(RadiumHome);
