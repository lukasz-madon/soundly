import { Actions } from 'flummox';


export default class VideoActions extends Actions {

  getVideos() {
    return [{
                id: 'pXEN57rFnIM',
                title: 'Samantha Fox - Naughty Girls Need Love Too',
                description: 'Music video by Samantha Fox performing Naughty Girls Need Love Too. (C) 1988 Zomba Records Limited',
              },
              {
                id: 'TS-G4UQTfUo',
                title: 'Caravan',
                description: ''
              },
              {
                id: 'PIyxD2Hx7G0',
                title: 'Grabina Drift',
                description: 'Foo1desc'
              },
              {
                id: 'Foo2',
                title: 'Foo2',
                description: 'Foo2desc'
              },
              {
                id: 'Foo3',
                title: 'Foo3',
                description: 'Foo3desc'
              },
              {
                id: 'Foo8',
                title: 'Foo8',
                description: 'Foo8desc'
              }];
  }
  setCurrentVideo(video) {
    return video;
  }
}