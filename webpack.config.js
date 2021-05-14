const _ = require('lodash')
const path = require('path')
const config = require('@freenit-framework/cli')

const myconfig = {}

const target = process.env.BACKEND_URL
if (target) {
  myconfig.devServer.proxy = {
    '/api': { target },
  }
}

const webpackConfig = _.merge(config.webpack(__dirname), myconfig)

console.log(webpackConfig)

module.exports = webpackConfig
