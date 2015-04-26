var React = require('react');
var mui = require('material-ui');

var SearchItem = React.createClass({
  render: function() {
    return (
      <div className="player-item col-xs-12 col-sm-4">
        <mui.Paper zDepth={1} innerClassName="player-item-content">
          <a href={this.props.hit.url} data-id={this.props.hit.id}>
            {this.props.hit._highlightResult.artist.value}
            <div className="row">
              <div className="col-xs-2"><i className="fa"></i></div>
                <div className="col-xs-10 txt text-right">
                  {this.props.hit._highlightResult.artist.value}
                <strong>{this.props.hit._highlightResult.title.value}</strong><br />
                <small className="text-muted">#{this.props.hit._highlightResult.tag.value}</small>
              </div>
            </div>
          </a>
        </mui.Paper>
      </div>
    );
  }
});

module.exports = SearchItem;
