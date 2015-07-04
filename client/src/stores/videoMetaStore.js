import { Store } from 'flummox';

export default class VideoMetaStore extends Store {

  constructor(flux) {
    super();

    const videoMetaActions = flux.getActions('videoMeta');
    this.register(videoMetaActions.setAudioVolume, this.handleAudioVolume);
    this.register(videoMetaActions.setMusicVolume, this.handleMusicVolume);

    this.state = {
      audioVolume: 0,
      musicVolume: 100,
      musicUrl: ''
    };
  }

  handleAudioVolume(volume) {
    this.setState({
      audioVolume: volume
    });
  }

  handleMusicVolume(volume) {
    this.setState({
      musicVolume: volume
    });
  }
}
