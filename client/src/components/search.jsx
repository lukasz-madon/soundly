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
      },
      query: ''
    };
  },
  handleClick: function(searchItem) {
    this.setState({
      player: {
        open: true
      }
    });
  },
  _handleQuery(event) {
    this.setState({ query: event.target.value });
  },
  render: function() {
    return (
      <div>
        <mui.TextField className="search" hintText="Search Music..." onChange={this._handleQuery} />
        <FluxComponent connectToStores={'search'}>
          <SearchList onChildClick={this.handleClick} query={this.state.query}/>
        </FluxComponent>
        <small>You must choose, but choose wisely. </small>
        <Player isOpen={this.state.player.open} />
      </div>
    );
  }
});

let SearchList = React.createClass({
  componentWillMount() {
    this.props.flux.getActions('search').getMusicSearchResult(this.props.query);
  },
  render: function() {
    console.log(this.props);
    return (
      <div id="player-grid" className="row">
        {this.props.hits.map((hit) => <SearchItem onClick={this.props.onChildClick} key={hit.id} hit={hit} /> )}
      </div>
    );
  }
});

export default Search;
