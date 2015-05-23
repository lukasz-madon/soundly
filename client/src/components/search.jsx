import mui from 'material-ui';
import React from 'react';

import SearchItem from './searchitem.jsx';

let Search = React.createClass({
  render: function() {
    let hits = [{ url: 'foo.com',
                  id: 1,
                  _highlightResult: {
                    artist: { value: 'fooart' }, title : { value: 'footitle' }, tag : { value: 'tagfoo' }
                  }
                },
                { url: 'bar.com',
                  id: 2,
                  _highlightResult: {
                    artist: { value: 'barart' }, title : { value: 'bartitle' }, tag : { value: 'tagbar' }
                  }
                },
                { url: 'baz.com',
                  id: 3,
                  _highlightResult: {
                    artist: { value: 'bazart' }, title : { value: 'baztitle' }, tag : { value: 'tagbaz' }
                  }
                },
                { url: 'bax.com',
                  id: 4,
                  _highlightResult: {
                    artist: { value: 'baxart' }, title : { value: 'baztitle' }, tag : { value: 'tagbaz' }
                  }
                }];
    let items = hits.map((hit) => <SearchItem key={hit.id} hit={hit} /> );
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

export default Search;
