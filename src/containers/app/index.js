import React from 'react';
import { Style } from 'radium';
import { Switch, Route } from 'react-router-dom';
import { DragDropContext as dndContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import reset from '../../reset.js';
import fonts from '../../fonts/fonts.js';
import Landing from '../../pages/landing';
import Home from '../../pages/home';
import Login from '../../pages/login';
import NotFound from '../../pages/not-found';


class App extends React.Component {
  render() {
    return (
      <div>
        <Style rules={fonts} />
        <Style rules={reset} />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/landing" component={Landing} />
          <Route path="*" component={NotFound} />
        </Switch>
      </div>
    );
  }
}


export default dndContext(HTML5Backend)(App);
