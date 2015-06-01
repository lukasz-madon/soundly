import mui from 'material-ui';
import React from 'react';


let Dashboard = React.createClass({
  render: function() {
    let vid = [{
                url: 'https://www.youtube.com/watch?v=pXEN57rFnIM',
                title: 'Samantha Fox - Naughty Girls Need Love Too',
                music: 'awesome tune',
                views: 123
              },
              {
                url: 'https://www.youtube.com/watch?v=TS-G4UQTfUo',
                title: 'Caravan',
                music: 'awesome tune2',
                views: 1234233
              }];
    let videos = vid.map((video, index) => <VideoItem key={index} id={index} {...video} />);
    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <h2>Your videos</h2>
            <table className="table table-striped table-hover ">
            <thead>
              <tr>
                <th></th>
                <th>Video</th>
                <th>Music</th>
                <th>Views</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {videos}
            </tbody>
          </table> 
          </div>
        </div>
      </div>
    );
  }
});

let VideoItem = React.createClass({
  render: function() {
    return (
      <tr>
        <td>{this.props.index}</td>
        <td><a href={this.props.url} target="_blank"> {this.props.title} </a></td>
        <td> {this.props.music} </td>
        <td className="views" data-url="">{this.props.views}</td>
        <td>free in beta</td>
      </tr>
    );
  }
});

export default Dashboard;
