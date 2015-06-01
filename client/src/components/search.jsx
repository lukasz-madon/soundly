import mui from 'material-ui';
import React from 'react';
import FluxComponent from 'flummox/component';

import SearchItem from './searchitem.jsx';
import Player from './player.jsx';


let Search = React.createClass({
  render: function() {
    return (
      <div>
        <FluxComponent connectToStores={'search'}>
          <SearchInner />
        </FluxComponent>
        <small>You must choose, but choose wisely. </small>
      </div>
    );
  }
});

let SearchInner = React.createClass({
  getInitialState: function(){
    return {
      player: {
        open: false,
        url: ''
      }
    };
  },
  componentWillMount() {
    this.search('');
  },
  handleClick: function(searchItem) {
    this.setState({
      player: {
        open: true,
        url: searchItem.props.hit.url
      }
    });
  },
  search(query) {
    this.props.flux.getActions('search').getMusicSearchResult(query);
  },
  _handleQuery(event) {
    let query = event.target.value;
    this.search(query);
  },
  render: function() {
    return (
      <div>
        <mui.TextField className="search" hintText="Search Music..." onChange={this._handleQuery} />
        <div id="player-grid" className="row">
          {this.props.hits.map((hit) => <SearchItem onClick={this.handleClick} key={hit.id} hit={hit} /> )}
        </div>
        <Player isOpen={this.state.player.open} />
      </div>
    );
  }
});

export default Search;
