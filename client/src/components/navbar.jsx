var React = require('react');
var mui = require('material-ui');
var Router = require('react-router');
var Link = Router.Link;


var Navbar = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },
  render: function() {
    return (
      <div className="navbar navbar-default">
        <div className="container">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-responsive-collapse">
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" href="/">
              <img className="img-responsive logo-nav push" src="static/img/logo.png" />
            </a>
          </div>
          <div className="navbar-collapse collapse navbar-responsive-collapse">
            <ul className="nav navbar-nav">
              <li className={this.context.router.isActive('music') ? 'active' : ''}>
                <Link to="music">Music</Link>
              </li>
              <li className={this.context.router.isActive('dashboard') ? 'active' : ''}>
                <Link to="dashboard">Dashboard</Link>
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right user-bar">          
              <li> 
                <a href="/logout">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  },
});

module.exports = Navbar;
