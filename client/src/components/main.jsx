var React = require('react');
var mui = require('material-ui');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

var Navbar = require('./navbar.jsx');
var Footer = require('./footer.jsx');


var Main = React.createClass({
  render: function() {
    return (
      <div>
        <Navbar />
        <RouteHandler/>
        <Footer/>
      </div>
    );
  }

});

module.exports = Main;
