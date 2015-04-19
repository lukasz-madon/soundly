var React = require('react');
var mui = require('material-ui');

var Search = React.createClass({
  render: function() {
    return (
      <div>
        <form className="search">
          <input id="q" autocomplete="off" autocorrect="off" type="text" className="form-control" placeholder="Music Search" spellcheck="false" />
        </form>
        <div id="player-grid" className="row">
        </div>
        <small>You must choose, but choose wisely. </small>
      </div>
    );
  }
});

module.exports = Search;
