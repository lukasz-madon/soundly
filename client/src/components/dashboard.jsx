var React = require('react');
var mui = require('material-ui');

var Dashboard = React.createClass({
  render: function() {
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
              <tr>
                <td>1</td>
                <td><a href="" target="_blank"> item.title </a></td>
                <td> m.title </td>
                <td className="views" data-url=""> item.views </td>
                <td>free in beta</td>
              </tr>
            </tbody>
          </table> 
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Dashboard;
