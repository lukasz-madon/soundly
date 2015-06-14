import mui from 'material-ui';
import React from 'react';
import FluxComponent from 'flummox/component';

import AudioChannel from './audiochannel.jsx';
import YouTube from './youtubeplayer.jsx';


let Preview = React.createClass({
  render: function() {
    return (
      <FluxComponent connectToStores={'video'}>
        <PreviewInner />
      </FluxComponent>
    );
  }
});

let PreviewInner = React.createClass({
  getInitialState: function() {
    return {
      musicVolume: 100,
      audioVolume: 0,
    };
  },
  handleMusicVolume: function(event, value) {
    this.setState({
      musicVolume: value * 100
    });
  },
  handleAudioVolume: function(event, value) {
    this.setState({
      audioVolume: value * 100
    });
  },
  render: function() {
    const opts = {
      height: '355',
      width: '568',// not sure what to choose. 100% could be confusing for the user that we change video,
      videoId: this.props.currentVideo.id,// but 640 won't work on small screens
      playerVars: { // https://developers.google.com/youtube/player_parameters<YouTube onPlay={this._onPlay} opts={opts} />
        autoplay: 1
      }
    };
    return (
      <div>
        <h5>Preview</h5>
        <div className="preview-player">
          <YouTube opts={opts} volume={this.state.audioVolume} />
        </div>
        <AudioChannel />
        <div id="audio_settings">
          <div className="row">
            <div className="col-xs-1">
              <span className="audio-time pull-left" id="audio_start">0:00</span>
            </div>
            <div className="col-xs-2">
              <span id="music_volume_desc" className="pull-right">Music volume</span>
            </div>
            <div className="col-xs-6">
              <mui.Slider name="music_volume" className="music-slider" defaultValue={1.0} onChange={this.handleMusicVolume} />
            </div>
            <div className="col-xs-3">
              <span className="audio-time pull-right" id="audio_end"></span>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-1">
            </div>
            <div className="col-xs-2">
              <span id="audio_volume_desc" className="pull-right">Audio volume</span>
            </div>
            <div className="col-xs-6">
              <mui.Slider name="audio_volume" className="audio-slider" defaultValue={0.0} onChange={this.handleAudioVolume} />
            </div>
            <div className="col-xs-3">
            </div>
          </div>
        </div>
      </div>
    );
  }
});

export default Preview;
