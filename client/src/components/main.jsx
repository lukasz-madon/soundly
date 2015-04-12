var React = require('react');
var mui = require('material-ui');
var Navbar = require('./navbar.jsx');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

var Main = React.createClass({

  render: function() {

    return (
      <div>
        <Navbar />
        <RouteHandler/>
      </div>
    );
  }

});

module.exports = Main;