const proxy = require('http-proxy-middleware')
module.exports = function(app) {
  const target = process.env.BACKEND_URL || 'http://localhost:5000'
  app.use(proxy(
    '/api',
    { target },
  ))
  app.use(proxy(
    '/media',
    { target },
  ))
}
