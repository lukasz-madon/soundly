import React from 'react';
import mui from 'material-ui';
import { Howl } from 'howler';
import FluxComponent from 'flummox/component';


let MusicPlayer = React.createClass({
  render: function() {
    return (
      <FluxComponent connectToStores={['videoMeta', 'musicPlayer']}>
        <MusicPlayerInner isOpen={this.props.isOpen} />
      </FluxComponent>
    );
  }
});

let MusicPlayerInner = React.createClass({
  getInitialState: function() {
    return {
      isPlaying: false,
      isPause: false
    }
  },
  componentDidUpdate: function(prevProps) {
    //player can be in 3 states: playing, pause, stop
    //user can press, pause, play, play on the same item
    //in each state we can change volume
    // later on seek in pause and playing
    if(this._player) {
      this._player.volume(this.props.musicVolume/100);
    }
    if(prevProps.musicUrl === this.props.musicUrl) {

    } else {
      if(this._player) {
        this._player.stop();
      }

    }
  },
  componentWillUnmount: function() {
    if (this._player) {
      this._player.stop();
      this._player = null;
    };
  },
  _initPlayer: function() {
      this._player = new Howl({
        urls: [this.props.musicUrl],
        volume: this.props.musicVolume/100,
        autoplay: true,
        buffer: true // force html5 audio
      });
      this.setState({ isPlaying: true, isPause: false });
  },
  _handlePause: function() {
    this._player.pause();
    this.setState({ isPlaying: false, isPause: true });
  },
  render: function() {
    return (
      <mui.Paper innerClassName="pad-container" className={this.props.isOpen ? 'slide-player show-up' : 'slide-player'}>
        <mui.IconButton iconClassName="fa fa-pause" onClick={this._handlePause}/>
        <span className="h4">{this.props.artist} - {this.props.title}</span>
      </mui.Paper>
    );
  }
});

export default MusicPlayer;
