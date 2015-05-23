import mui from 'material-ui';
import React from 'react';
import Router, { RouteHandler } from 'react-router';

import Navbar from './navbar.jsx';
import Footer from './footer.jsx';


let Main = React.createClass({
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

export default Main;
