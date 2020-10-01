const path = require('path')


module.exports = {
  sections: [
    {
      name: 'Components',
      components: 'src/components/*/index.js',
    },
    {
      name: 'Pages',
      components: [
        'src/pages/*/{detail,list}.js',
        'src/pages/auth/{change-password,confirm,login,register,reset}.js',
      ],
    },
    {
      name: 'Templates',
      components: 'src/templates/*/{detail,list}.js',
    },
  ],
  styleguideComponents: {
    Wrapper: path.join(__dirname, 'src/Provider.js')
  },
}
