var React = require('react');
var mui = require('material-ui');

var PublishFrom = React.createClass({
  render: function() {
    var menuItems = [
      { payload: '1', text: 'Public' },
      { payload: '2', text: 'Unlisted' },
      { payload: '3', text: 'Private' },
    ];
    return (
      <div>
        <div className="row">
           <div className="col-lg-12">
             <mui.TextField floatingLabelText="Title" />
           </div>
         </div>
         <div className="row">
           <div className="col-lg-12">
             <mui.TextField floatingLabelText="Description" multiLine={true} />
           </div>
         </div>
         <div className="row">
          <div className="col-xs-5">
            <mui.RaisedButton className="publish-btn" label="Publish" primary={true}/>
           </div>
          <div className="col-xs-6">
            <mui.DropDownMenu menuItems={menuItems} />
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <small className="text-muted">Any second thoughts about music? No? Publish it!</small>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = PublishFrom;
