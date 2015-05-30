import { Actions } from 'flummox';


const client = algoliasearch('KR1O1TU8CE', '9ea0d0c4da7cbedf6cdc413fe0801efa');
const index = client.initIndex('music');

export default class SearchActions extends Actions {

  getMusicSearchResult(query) {
    //TODO(lukaszma) add catch for erros
    return index.search(query);
  }
}