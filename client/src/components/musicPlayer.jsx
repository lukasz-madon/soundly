import React from 'react';
import mui from 'material-ui';
import { Howl } from 'howler';
import FluxComponent from 'flummox/component';


let MusicPlayer = React.createClass({
  render: function() {
    return (
      <FluxComponent connectToStores={'videoMeta'}>
        <MusicPlayerInner isOpen={this.props.isOpen} />
      </FluxComponent>
    );
  }
});

let MusicPlayerInner = React.createClass({
  componentDidUpdate: function(prevProps) {
    let volume = this.props.musicVolume/100;
    if(prevProps.musicUrl === this.props.musicUrl) {
      if(this._player) {
        this._player.volume(volume);
      }
    } else {
      if(this._player) {
        this._player.stop();
      }
      this._player = new Howl({
        urls: [this.props.musicUrl],
        volume: volume,
        autoplay: true,
        buffer: true // force html5 audio
      });
    }
  },
  render: function() {
    return (
      <mui.Paper innerClassName="pad-container" className={this.props.isOpen ? 'slide-player show-up' : 'slide-player'}>
        Playing... <mui.IconButton iconClassName="fa fa-pause"/>{this.props.musicUrl}
      </mui.Paper>
    );
  }
});

export default MusicPlayer;
