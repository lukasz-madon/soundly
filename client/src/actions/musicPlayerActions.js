import { Actions } from 'flummox';


export default class musicPlayerActions extends Actions {

  setTitle(title) {
    return title;
  }

  setArtist(artist) {
    return artist;
  }

  setMusicUrl(musicUrl) {
  	return musicUrl;
  }
}
