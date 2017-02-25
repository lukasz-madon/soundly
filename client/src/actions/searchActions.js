import { Actions } from 'flummox';

const client = algoliasearch(Soundly.Algolia.appId, Soundly.Algolia.apiKey);
const index = client.initIndex('music');

export default class SearchActions extends Actions {

  getMusicSearchResult(query) {
    //TODO(lukaszma) add catch for errors
    return index.search(query);
  }
}
