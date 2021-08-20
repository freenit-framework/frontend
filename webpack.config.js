const _ = require('lodash')
const path = require('path')
const config = require('@freenit-framework/cli')

const myconfig = {}
const webpackConfig = _.merge(config.webpack(__dirname), myconfig)

const target = process.env.BACKEND_URL
if (target) {
  webpackConfig.devServer.proxy = {
    '/api': { target },
  }
}


module.exports = webpackConfig
