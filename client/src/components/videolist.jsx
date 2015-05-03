var React = require('react');
var mui = require('material-ui');

var VideoList = React.createClass({
  render: function() {
    var foo = [{
                id: 'pXEN57rFnIM',
                title: 'Samantha Fox - Naughty Girls Need Love Too',
                description: 'Music video by Samantha Fox performing Naughty Girls Need Love Too. (C) 1988 Zomba Records Limited',
              },
              {
                id: 'TS-G4UQTfUo',
                title: 'Caravan',
                description: ''
              }];
    var videos = foo.map(function(video, index){
      return (
        <tr>
          <td>{index + 1}</td>
          <td className="video-link" data-id={video.id} data-description={video.description}>
            {video.title}
          </td>
        </tr>
      );
    });
    return (
      <div>
        <h4>Pick Youtube Video</h4>
          <table className="table table-striped table-hover ">
            <tbody>
              {videos}
            </tbody>
          </table>
      </div>
    );
  }
});

module.exports = VideoList;
