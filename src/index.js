import React from 'react';
import ReactDOM from 'react-dom';
import Root from './containers/root';
import registerServiceWorker from './registerServiceWorker';
import injectTapEventPlugin from 'react-tap-event-plugin';


// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
