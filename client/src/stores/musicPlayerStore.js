import { Store } from 'flummox';

export default class MusicPlayerStore extends Store {

  constructor(flux) {
    super();

    const musicPlayerActions = flux.getActions('musicPlayer');
    this.register(musicPlayerActions.setTitle, this.handleTitle);
    this.register(musicPlayerActions.setArtist, this.handleArtist);
    this.register(musicPlayerActions.setMusicUrl, this.handleMusicUrl);

    this.state = {
      title: '',
      artist: '',
      musicUrl: ''
    };
  }

  handleTitle(title) {
    this.setState({
      title: title
    });
  }

  handleArtist(artist) {
    this.setState({
      artist: artist
    });
  }

  handleMusicUrl(musicUrl) {
    this.setState({
      musicUrl: musicUrl
    });
  }
}
