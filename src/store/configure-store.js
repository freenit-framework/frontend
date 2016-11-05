/* eslint global-require: 0 */

let configureStore;

if (process.env.NODE_ENV === 'production') {
  configureStore = require('./configure-store.prod');
} else {
  configureStore = require('./configure-store.dev');
}


module.exports = configureStore;
