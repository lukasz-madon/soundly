var React = require('react');
var mui = require('material-ui');

var VideoList = React.createClass({
  render: function() {
    return (
      <div>
        <h4>Pick Youtube Video</h4>
          <table className="table table-striped table-hover ">
            <tbody>
              <tr>
                <td>loop.index</td>
                <td className="video-link" data-id="video.id" data-description="video.description ">
                  video.title
                </td>
              </tr>
            </tbody>
          </table>
      </div>
    );
  }
});

module.exports = VideoList;
