import mui from 'material-ui';
import React from 'react';
import Router, { Link } from 'react-router';


let Navbar = React.createClass({
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
                <a href="/logout">Hi test</a>
              </li>
              <li>
                <img className="img-rounded channel-thumbnail" src="https://lh3.googleusercontent.com/-q1Smh9d8d0g/AAAAAAAAAAM/AAAAAAAAAAA/3YaY0XeTIPc/photo.jpg" />
              </li>
              <li> 
                <a href="/logout">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
});

export default Navbar;
