var React = require('react');
var mui = require('material-ui');

var PublishFrom = React.createClass({
  render: function() {
    return (
      <div className="well">
        <form className="form-horizontal">
           <fieldset>
             <div className="form-group">
              <label for="title" className="col-lg-2 control-label">Title</label>
               <div className="col-lg-12">
                 <input type="text" className="form-control" id="title" placeholder="Title" />
               </div>
             </div>
             <div className="form-group">
              <label for="description" className="col-lg-2 control-label">Description</label>
               <div className="col-lg-12">
                 <textarea className="form-control" rows="3" id="description" placeholder="Description"></textarea>
               </div>
             </div>
             <div className="form-group">
               <div className="col-xs-7">
                 <select className="form-control" id="privacyStatus">
                   <option>public</option>
                   <option>unlisted</option>
                   <option>private</option>
                 </select>
               </div>
              <div className="col-xs-5">
                <a className="btn btn-primary pull-right" id="publish">Publish</a>
              </div>
            </div>
            <div className="form-group">
              <div className="col-lg-12">
                <small className="text-muted">Any second thoughts about music? No? Publish it!</small>
              </div>
            </div>
           </fieldset>
         </form>
       </div>
    );
  }
});

module.exports = PublishFrom;
