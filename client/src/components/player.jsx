import React from 'react';
import mui from 'material-ui';


let Player = React.createClass({
  render: function() {
    return (
        <mui.Paper innerClassName="pad-container" className={this.props.isOpen ? 'slide-player show-up' : 'slide-player'}>
          Playing...
        </mui.Paper>
    );
  }
});

export default Player;
