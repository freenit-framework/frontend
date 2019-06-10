module.exports = {
  modify: (config, { target, dev }, webpack) => {
    if (dev && target === 'web') {
      config.devServer.host = '0.0.0.0'
      if (process.env.FRONTEND_URL) {
        config.output.publicPath = process.env.FRONTEND_URL
      }
    }
    return config
  },
}
