const proxy = require('http-proxy-middleware')
module.exports = function(app) {
  console.log(process.env.BACKEND_URL)
  app.use(proxy(
    '/api',
    {
      target: process.env.BACKEND_URL,
    }
  ))
}
