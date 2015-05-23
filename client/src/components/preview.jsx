import mui from 'material-ui';
import React from 'react';

import AudioChannel from './audiochannel.jsx';

let Preview = React.createClass({
  componentDidMount: function() {
    let vidId = 'q29OYUenJ8c';
    swfobject.embedSWF(`http://www.youtube.com/v/${vidId}?enablejsapi=1&playerapiid=ytplayer&version=3`, 
      'ytapiplayer', '100%', '400', '8', null, null,
       { allowScriptAccess: 'always' }, { id: 'myytplayer' });
  },
  render: function() {
    return (
      <div>
        <h5>Preview</h5>
        <div id="ytapiplayer">
          You have no videos or Flash/JavaScript is disabled.
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
              <mui.Slider name="music_volume" className="music-slider" defaultValue={1.0} />
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
              <mui.Slider name="audio_volume" className="audio-slider" defaultValue={0.0} />
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
