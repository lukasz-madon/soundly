var React = require('react');
var mui = require('material-ui');
var VideoList = require('./videolist.jsx');
var PublishForm = require('./publishform.jsx');
var Preview = require('./preview.jsx');
var Search = require('./search.jsx');

var Music  = React.createClass({
  render: function() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-8">
            <Preview />
            <Search />
          </div>
          <div className="col-md-4">
            <VideoList />
            <PublishForm />
            <div id="ok"></div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Music;
