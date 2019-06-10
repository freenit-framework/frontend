import React from 'react'
import { Route, Switch } from 'react-router-dom'
import './App.css'

// Pages
import Dashboard from 'pages/dashboard'
import Landing from 'pages/landing'
import Login from 'pages/login'


const App = () => {
  return (
    <Switch>
      <Route exact path="/" component={Dashboard} />
      <Route exact path="/landing" component={Landing} />
      <Route exact path="/login" component={Login} />
    </Switch>
  )
}

export default App
