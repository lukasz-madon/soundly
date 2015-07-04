import React from 'react';
import globalize from 'random-global';
import load from 'require-sdk';

/**
 * Create a new `player` by requesting and using the YouTube Iframe API
 *
 * @param {Object} props
 *   @param {String} videoId - id of a video to be loaded
 *   @param {Object} playerVars - https://developers.google.com/youtube/player_parameters
 *
 * @param {Function} cb
 */
const createPlayer = (props, cb) => {
  const sdk = loadApi();

  return sdk((err) => {
    // need to handle err better.
    if (err) {
      console.error(err);
    }
    return cb(new window.YT.Player(props.id, props.opts));
  });
};

const loadApi = () => {
  const sdk = load('https://www.youtube.com/iframe_api', 'YT');
  const loadTrigger = sdk.trigger();

  // The YouTube API requires a global ready event handler.
  // The YouTube API really sucks.
  window.onYouTubeIframeAPIReady = () => {
    loadTrigger();
    delete window.onYouTubeIframeAPIReady;
  };

  return sdk;
};

let YouTube = React.createClass({

  getDefaultProps: function() {
    return {
      id: 'yt-player',
      opts: {},
      volume: 0,
      onReady: () => {},
      onPlay: () => {},
      onPause: () => {},
      onEnd: () => {}
    };
  },

  propTypes: {
    // div id
    id: React.PropTypes.string,

    // Options passed to a new `YT.Player` instance
    // https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
    // NOTE: Do not include event listeners in here, they will be ignored.
    opts: React.PropTypes.object,
    // event subscriptions
    onReady: React.PropTypes.func,
    onPlay: React.PropTypes.func,
    onPause: React.PropTypes.func,
    onEnd: React.PropTypes.func
  },

  getInitialState: function() {
    this._internalPlayer = null;
    this._playerReadyHandle = null;
    this._stateChangeHandle = null;
    return null;
  },

  /**
   * @param {Object} nextProps
   * @returns {Boolean}
   */
  shouldComponentUpdate(nextProps) {
    return nextProps.opts.videoId !== this.props.opts.videoId;
  },

  componentDidMount() {
    this._createPlayer();
  },

  componentDidUpdate() {
    this._createPlayer();
  },

  componentWillUnmount() {
    this._changeVolume(100); //well, f***, yt sets volume on all yt players. Thought this will fix it, but it doesn't.
    this._destroyPlayer();
  },

  _changeVolume(volume){
    // when router changes the rendered element player is loaded, but doesn't have all props
    if(this._internalPlayer && this._internalPlayer.setVolume) {
      this._internalPlayer.setVolume(volume);
    }
  },

  componentWillReceiveProps: function(nextProps) {
    this._changeVolume(nextProps.volume);
  },

  render: function() {
    return (
      <div className="yt-player-wrapper">
        <div id={this.props.id} />
      </div>
    );
  },

  /**
   * Create a new `internalPlayer`.
   *
   * This is called on every render, which is only triggered after
   * `props.url` has changed. Setting or changing any other props
   * will *not* cause a new player to be loaded.
   */
  _createPlayer() {
    this._destroyPlayer();

    createPlayer(this.props, (player) => {
      this._setupPlayer(player);
    });

  },

  /**
   * Destroy the currently embedded player/iframe and remove any event listeners
   * bound to it.
   */
  _destroyPlayer() {
    if (this._internalPlayer) {
      this._unbindEvents();
      this._destroyGlobalEventHandlers();
      this._internalPlayer.destroy();
    }
  },

  /**
   * Integrate a newly created `player` with the rest of the component.
   *
   * @param {Object} player
   */
  _setupPlayer(player) {
    this._internalPlayer = player;
    this._globalizeEventHandlers();
    this._bindEvents();
  },

  _handlePlayerReady(event) {
    this.props.onReady(event);
    this._changeVolume(this.props.volume);
  },

  _handlePlayerStateChange(event) {
    switch(event.data) {

      case window.YT.PlayerState.ENDED:
        this.props.onEnd(event);
        break;

      case window.YT.PlayerState.PLAYING:
        this.props.onPlay(event);
        break;

      case window.YT.PlayerState.PAUSED:
        this.props.onPause(event);
        break;

      default:
        return;
    }
  },

  _globalizeEventHandlers() {
    this._playerReadyHandle = globalize(this._handlePlayerReady);
    this._stateChangeHandle = globalize(this._handlePlayerStateChange);
  },

  _destroyGlobalEventHandlers() {
    delete window[this._playerReadyHandle];
    delete window[this._stateChangeHandle];
  },

  _bindEvents() {
    this._internalPlayer.addEventListener('onReady', this._playerReadyHandle);
    this._internalPlayer.addEventListener('onStateChange', this._stateChangeHandle);
  },

  _unbindEvents() {
    this._internalPlayer.removeEventListener('onReady', this._playerReadyHandle);
    this._internalPlayer.removeEventListener('onStateChange', this._stateChangeHandle);
  }

});

export default YouTube;
