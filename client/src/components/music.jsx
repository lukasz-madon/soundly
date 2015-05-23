import mui from 'material-ui';
import React from 'react';

import VideoList from './videolist.jsx';
import PublishForm from './publishform.jsx';
import Preview from './preview.jsx';
import Search from './search.jsx';


let Music = React.createClass({
  render: function() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-8">
            <Preview />
            <Search />
          </div>
          <div className="col-md-4">
            <h5>Pick Youtube Video</h5>
            <mui.Paper innerClassName="pad-container">
              <VideoList />
              <PublishForm />
              <div id="ok"></div>
            </mui.Paper>
          </div>
        </div>
      </div>
    );
  }
});

export default Music;
