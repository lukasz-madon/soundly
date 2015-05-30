import { Store } from 'flummox';

export default class SearchStore extends Store {

  constructor(flux) {
    super();

    const searchActions = flux.getActions('search');
    this.register(searchActions.getMusicSearchResult, this.handleMusicSearchResult);

    this.state = { hits: [] };
  }

  handleMusicSearchResult(queryResult) {
    this.setState(queryResult)
  }
}
