const { createProxyMiddleware } = require('http-proxy-middleware')
const target = process.env.BACKEND_URL

module.exports = function(app) {
  if (target) {
    app.use(createProxyMiddleware('/api', { target }))
    app.use(createProxyMiddleware('/media', { target }))
  }
}
