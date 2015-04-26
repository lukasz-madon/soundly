var React = require('react');
var mui = require('material-ui');
var SearchItem = require('./searchitem.jsx');

var Search = React.createClass({
  render: function() {
    var hits = [{ url: 'foo.com',
                  id: 1,
                  _highlightResult: { 
                    artist: { value: 'fooart' }, title : { value: 'footitle' }, tag : { value: 'tagfoo' }
                  }
                },
                { url: 'bar.com',
                  id: 1,
                  _highlightResult: { 
                    artist: { value: 'barart' }, title : { value: 'bartitle' }, tag : { value: 'tagbar' }
                  }
                },
                { url: 'baz.com',
                  id: 1,
                  _highlightResult: { 
                    artist: { value: 'bazart' }, title : { value: 'baztitle' }, tag : { value: 'tagbaz' }
                  }
                }];
    var items = hits.map(function(hit) {
      return <SearchItem hit={hit} />;
    });
    return (
      <div>
        <mui.TextField className="search" hintText="Search Music..." />
        <div id="player-grid" className="row">
           {items}
        </div>
        <small>You must choose, but choose wisely. </small>
      </div>
    );
  }
});

module.exports = Search;
