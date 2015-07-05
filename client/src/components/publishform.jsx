import mui from 'material-ui';
import React from 'react';
import FluxComponent from 'flummox/component';


let PublishFrom = React.createClass({
  render: function() {
    return (
      <FluxComponent connectToStores={['video', 'videoMeta']}>
        <PublishFromInner />
      </FluxComponent>
    );
  }
});

const PUBLIC_STATUS = 'Public';
const UNLISTED_STATUS = 'Unlisted';
const PRIVATE_STATUS = 'Private';

let PublishFromInner = React.createClass({
  getInitialState: function(){
    return {
      description: '',
      privacyStatus : PUBLIC_STATUS,
      title: ''
    };
  },
  handlePublish: function() {
    let newVideo = {
      audioVolume: this.props.audioVolume,
      currentVideo: this.props.currentVideo,
      musicUrl: this.props.musicUrl,
      musicVolume: this.props.musicVolume,
      description: this.state.description,
      privacyStatus : this.state.privacyStatus,
      title: this.state.title
    };
    $.ajax('process-video', {
      data : JSON.stringify(newVideo),
      contentType : 'application/json',
      type : 'POST'
    });
  },
  handlePrivacyStatus: function(e, index, menuItem) {
    this.setState({
      privacyStatus: menuItem.text
    });
  },
  handleTitle: function(e) {
    this.setState({
      title: e.target.value
    });
  },
  handleDescription: function(e) {
    this.setState({
      description: e.target.value
    });
  },
  render: function() {
    let menuItems = [
      { payload: '1', text: PUBLIC_STATUS },
      { payload: '2', text: UNLISTED_STATUS },
      { payload: '3', text: PRIVATE_STATUS },
    ];
    // Add tags
    return (
      <div>
        <div className="row">
           <div className="col-lg-12">
             <mui.TextField className="text-field-full-width" floatingLabelText="Title" onChange={this.handleTitle} />
           </div>
         </div>
         <div className="row">
           <div className="col-lg-12">
             <mui.TextField className="text-field-full-width" floatingLabelText="Description" multiLine={true} onChange={this.handleDescription}/>
           </div>
         </div>
         <div className="row">
          <div className="col-xs-6">
            <mui.RaisedButton className="publish-btn" label="Publish" primary={true} onClick={this.handlePublish}/>
           </div>
          <div className="col-xs-6">
            <mui.DropDownMenu menuItems={menuItems} onChange={this.handlePrivacyStatus}/>
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

export default PublishFrom;
