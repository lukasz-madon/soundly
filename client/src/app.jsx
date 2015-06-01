import React from 'react';
import Router, { Route, NotFoundRoute, Redirect } from 'react-router';
import { Flummox } from 'flummox';
import FluxComponent from 'flummox/component';

import injectTapEventPlugin from 'react-tap-event-plugin';

import SearchActions from './actions/searchActions.js';
import VideoActions from './actions/videoActions.js';
import SearchStore from './stores/searchStore.js';
import VideoStore from './stores/VideoStore.js';
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

class Flux extends Flummox {
  constructor() {
    super();
    this.createActions('search', SearchActions);
    this.createStore('search', SearchStore, this);
    this.createActions('video', VideoActions);
    this.createStore('video', VideoStore, this);
  }
}

const flux = new Flux();

const routes = (
  <Route handler={Main} path="/">
    <Redirect from="/" to="music" />
    <Route name="music" handler={Music} />
    <Route name="dashboard" handler={Dashboard} />
    <NotFoundRoute handler={NotFound}/>
  </Route>
);

Router.run(routes, (Handler) => React.render(
	<FluxComponent flux={flux}>
    <Handler />
  </FluxComponent>,
  document.getElementById('content'))
);
