(function () {
  var React = require('react');
  var injectTapEventPlugin = require('react-tap-event-plugin');
  var Router = require('react-router');
  var Route = Router.Route;
  var NotFoundRoute = Router.NotFoundRoute;
  var DefaultRoute = Router.DefaultRoute;

  var Main = require('./components/main.jsx');
  var Music = require('./components/music.jsx');
  var Dashboard = require('./components/dashboard.jsx');

  //Needed for React Developer Tools
  window.React = React;

  //Needed for onTouchTap
  //Can go away when react 1.0 release
  //Check this repo:
  //https://github.com/zilverline/react-tap-event-plugin
  injectTapEventPlugin();


  var routes = (
    <Route handler={Main} path="/">
      <DefaultRoute handler={Music} />
      <Route name="music" handler={Music} />
      <Route name="dashboard" handler={Dashboard} />
      {/*<NotFoundRoute handler={NotFound}/> */}
    </Route>
  );

  Router.run(routes, Router.HistoryLocation, function (Handler) {
    React.render(<Handler/>, document.getElementById('content'));
  });

})();