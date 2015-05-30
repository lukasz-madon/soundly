import mui from 'material-ui';
import React from 'react';

let SearchItem = React.createClass({
  handleClick: function () {
    this.props.onClick(this);
  },
  //href={this.props.hit.url}
  render: function() {
    let { hit } = this.props;
    return (
      <div className="player-item col-xs-12 col-sm-4">
        <mui.Paper zDepth={1} innerClassName="player-item-content" onClick={this.handleClick}>
          <a>
            <div className="row">
              <div className="col-xs-2">
                <i className="fa"></i>
              </div>
              <div className="col-xs-10 txt text-right">
                <span dangerouslySetInnerHTML={{ __html: hit._highlightResult.artist.value }}></span><br />
                <strong dangerouslySetInnerHTML={{ __html: hit._highlightResult.title.value }}></strong><br />
                <small className="text-muted">#</small>
                <small className="text-muted" dangerouslySetInnerHTML={{ __html: hit._highlightResult.title.value }}></small>
              </div>
            </div>
          </a>
        </mui.Paper>
      </div>
    );
  }
});

export default SearchItem;
