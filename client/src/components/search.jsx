import mui from 'material-ui';
import React from 'react';
import FluxComponent from 'flummox/component';

import SearchItem from './searchitem.jsx';
import MusicPlayer from './musicPlayer.jsx';


let Search = React.createClass({
  render: function() {
    return (
      <div>
        <FluxComponent connectToStores={['search', 'videoMeta']}>
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
        open: false
      }
    };
  },
  componentWillMount() {
    this.search('');
  },
  handleClick: function(searchItem) {
    this.props.flux.getActions('videoMeta').setMusicUrl(searchItem.props.hit.url);
    this.setState({
      player: {
        open: true
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
      <div className="search-container">
        <mui.TextField className="search" hintText="Search Music..." onChange={this._handleQuery} />
        <div id="player-grid" className="row">
          {this.props.hits.map((hit) => <SearchItem onClick={this.handleClick} key={hit.id} hit={hit} /> )}
        </div>
        <MusicPlayer isOpen={this.state.player.open} />
      </div>
    );
  }
});

export default Search;
