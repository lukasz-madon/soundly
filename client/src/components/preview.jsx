var React = require('react');

var Preview = React.createClass({
  render: function() {
    return (
      <div>
        <h4>Preview</h4>
        <div id="ytapiplayer">
          You have no videos or Flash/JavaScript is disabled.
        </div>
        <div id="audio_channel">
        </div>
        <div id="audio_settings">
          <div className="row">
            <div className="col-xs-3">
              <span className="audio-time pull-left" id="audio_start">0:00</span>
            </div>
            <div className="col-xs-6">
              <span id="music_volume_desc">Music volume</span>
              <input className="center-block" id="music_volume" type="text" data-slider="true" value="1.0" /><br />
              <span id="audio_volume_desc">Audio volume</span>
              <input className="center-block" id="audio_volume" type="text" data-slider="true" value="0.0" />
            </div>
            <div className="col-xs-3">
              <span className="audio-time pull-right" id="audio_end"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Preview;
