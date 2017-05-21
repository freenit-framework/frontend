import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Snackbar from 'material-ui/Snackbar';
import Paper from 'material-ui/Paper';
import { errors } from '../../constants';
import { isLoggedIn } from '../../utils';
import actions from './actions';
import radium from 'radium';

function mapStateToProps(state) {
  return {
    token: state.login.token,
    status: state.login.status,
    error: state.login.error,
  };
}


const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    justifyContent: 'center',
    alignItems: 'center',
  },

  form: {
    padding: '20px 50px',
  },

  button: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },

  title: {
    textAlign: 'center',
    fontFamily: 'inherit',
  },
};


class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
    this.handleEmailChange = (event) => {
      this.setState({ email: event.target.value });
    };

    this.handlePasswordChange = (event) => {
      this.setState({ password: event.target.value });
    };

    this.handleSubmit = (event) => {
      event.preventDefault();
      this.props.login(this.state.email, this.state.password);
    };

    this.handleNotificationClose = () => {
      this.setState({ status: '', message: '' });
    };
  }

  componentWillMount() {
    if (isLoggedIn()) {
      this.context.router.push('/');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.status === 'error') {
      this.setState({ status: 'error', message: nextProps.error });
      this.props.reset();
    }
  }

  shouldComponentUpdate() {
    if (isLoggedIn()) {
      this.context.router.push('/');
      return false;
    }
    return true;
  }


  render() {
    const notificationOpen = this.state.status === 'error';
    const notification = notificationOpen ? errors.login[this.state.message] : '';
    return (
      <div style={styles.root}>
        <Paper zDepth={3}>
          <form style={styles.form} onSubmit={this.handleSubmit}>
            <h1 style={styles.title}>Login</h1>
            <div>
              <TextField
                floatingLabelText="Email"
                onChange={this.handleEmailChange}
                autoFocus
                required
              />
            </div>
            <div>
              <TextField
                floatingLabelText="Password"
                type="password"
                onChange={this.handlePasswordChange}
                required
              />
            </div>
            <div style={styles.button}>
              <RaisedButton label="login" type="submit" />
            </div>
          </form>
        </Paper>
        <Snackbar
          open={notificationOpen}
          message={notification}
          autoHideDuration={4000}
          action="close"
          onActionTouchTap={this.handleNotificationClose}
          onRequestClose={this.handleNotificationClose}
        />
      </div>
    );
  }
}


Login.propTypes = {
  children: PropTypes.node,
  status: PropTypes.string,
  error: PropTypes.string,
  reset: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
};

Login.contextTypes = {
  router: PropTypes.object.isRequired,
};


export default connect(mapStateToProps, actions)(radium(Login));
