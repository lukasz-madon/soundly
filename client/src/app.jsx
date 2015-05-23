import React from 'react';
import Router, { Route, NotFoundRoute, Redirect } from 'react-router';

import injectTapEventPlugin from 'react-tap-event-plugin';

import AppAction from './actions/appActions';
import Dashboard from './components/dashboard.jsx';
import Main from './components/main.jsx';
import Music from './components/music.jsx';
import NotFound from './components/notfound.jsx';

//Needed for React Developer Tools
window.React = React;

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();


let routes = (
  <Route handler={Main} path="/">
    <Redirect from="/" to="music" />
    <Route name="music" handler={Music} />
    <Route name="dashboard" handler={Dashboard} />
    <NotFoundRoute handler={NotFound}/>
  </Route>
);
Router.run(routes, (Handler) => React.render(<Handler />, document.getElementById('content')) );
