let root;
if (process.env.NODE_ENV === 'production') {
  root = require('./root.prod');
} else {
  root = require('./root.dev');
}


export default root.default;
