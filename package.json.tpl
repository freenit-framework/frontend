{
  "name": "frontend-startkit",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@material-ui/core": "^3.0.2",
    "@material-ui/icons": "^3.0.1",
    "axios": "^0.18.0",
    "mobx": "^5.8.0",
    "mobx-react": "^5.4.3",
    "prop-types": "^15.6.2",
    "react": "^16.5.0",
    "react-dom": "^16.5.0",
    "react-router-dom": "^4.3.1",
    "react-scripts": "^1.1.5"
  },
  "devDependencies": {
    "babel-eslint": "^9.0.0",
    "enzyme": "^3.6.0",
    "enzyme-adapter-react-16": "^1.5.0",
    "eslint": "^5.6.0",
    "eslint-config-airbnb": "^17.1.0",
    "eslint-plugin-import": "^2.14.0",
    "eslint-plugin-jsx-a11y": "^6.1.1",
    "eslint-plugin-react": "^7.11.1",
    "react-app-rewire-mobx": "^1.0.9",
    "react-app-rewired": "^1.6.2"
  },
  "scripts": {
    "start": "react-app-rewired start",
    "build": "react-app-rewired build",
    "pretest": "eslint src",
    "test": "react-app-rewired test --env=jsdom",
    "eject": "react-app-rewired eject"
  },
  "proxy": "HTTP_PROXY"
}
