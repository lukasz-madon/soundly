var React = require('react');
var mui = require('material-ui');

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

module.exports = Preview;
