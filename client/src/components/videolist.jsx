import mui from 'material-ui';
import React from 'react';
import FluxComponent from 'flummox/component';


let VideoList = React.createClass({
  render: function() {
    return (
      <FluxComponent connectToStores={'video'}>
        <VideoListInner />
      </FluxComponent>
    );
  }
});

let VideoListInner = React.createClass({
  componentWillMount() {
    this.props.flux.getActions('video').getVideos();
  },
  handleClick(video) {
    this.props.flux.getActions('video').setCurrentVideo(video);
  },
  render: function() {
    return (
      <table className="table table-striped table-hover video-list">
        <tbody>
          {this.props.videos.map((video, i) => <VideoItem video={video} index={i} key={video.id} onClick={this.handleClick}/>)}
        </tbody>
      </table>
    );
  }
});

let VideoItem = React.createClass({
  handleClick() {
    this.props.onClick(this.props.video);
  },
  render: function() {
      return (
        <tr onClick={this.handleClick}>
          <td>{this.props.index + 1}</td>
          <td className="video-link">
            {this.props.video.title}
          </td>
        </tr>
      );
    }
});

export default VideoList;
