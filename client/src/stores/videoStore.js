import { Store } from 'flummox';

export default class VideoStore extends Store {

  constructor(flux) {
    super();

    const videoActions = flux.getActions('video');
    this.register(videoActions.getVideos, this.handleVideoResponse);
    this.register(videoActions.setCurrentVideo, this.handleCurrentVideo);

    this.state = {
      videos: [],
      currentVideo: {}
    };
  }

  handleVideoResponse(videos) {
    this.setState({
      videos: videos,
      currentVideo: videos[0]
    });
  }

  handleCurrentVideo(video) {
    this.setState({
      currentVideo: video
    });
  }
}
