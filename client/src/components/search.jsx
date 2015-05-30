import mui from 'material-ui';
import React from 'react';
import FluxComponent from 'flummox/component';

import SearchItem from './searchitem.jsx';
import Player from './player.jsx';


let Search = React.createClass({
  getInitialState: function(){
    return {
      player: {
        open: false
      }
    };
  },
  handleClick: function(searchItem) {
    this.setState({
      player: {
        open: true
      }
    });
  },
  render: function() {
    return (
      <div>
        <FluxComponent connectToStores={'search'}>
          <SearchList onChildClick={this.handleClick} />
        </FluxComponent>
        <small>You must choose, but choose wisely. </small>
        <Player isOpen={this.state.player.open} />
      </div>
    );
  }
});

let SearchList = React.createClass({
  componentWillMount() {
    this.search('');
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
          {this.props.hits.map((hit) => <SearchItem onClick={this.props.onChildClick} key={hit.id} hit={hit} /> )}
        </div>
      </div>
    );
  }
});

export default Search;
