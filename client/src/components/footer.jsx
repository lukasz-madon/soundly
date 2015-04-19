var React = require('react');

var Footer = React.createClass({
  render: function() {
    return (
      <footer id="footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <ul className="list-inline">
                <li><a href="/about">About</a> </li>
                <li className="footer-menu-divider">&sdot;</li>
                <li><a href="/faq">FAQ</a></li>
                <li className="footer-menu-divider">&sdot;</li>
                <li><a href="/terms">Terms</a></li>
                <li className="footer-menu-divider">&sdot;</li>
                <li><a href="privacy">Privacy</a></li>
              </ul>
              <p className="copyright text-muted small">&copy; Soundly.io 2014 </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }
});

module.exports = Footer;
