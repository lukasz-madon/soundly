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
              },
              {
                id: 'Foo1',
                title: 'Foo1',
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
    var videos = foo.map(function(video, index){
      return (
        <tr key={video.id}>
          <td>{index + 1}</td>
          <td className="video-link" data-id={video.id} data-description={video.description}>
            {video.title}
          </td>
        </tr>
      );
    });
    return (
      <table className="table table-striped table-hover video-list">
        <tbody>
          {videos}
        </tbody>
      </table>
    );
  }
});

module.exports = VideoList;
