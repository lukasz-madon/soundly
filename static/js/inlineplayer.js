/**
 *
 * SoundManager 2 Demo: Play MP3 links "in-place"
 * ----------------------------------------------
 *
 * http://schillmania.com/projects/soundmanager2/
 *
 * A simple demo making MP3s playable "inline"
 * and easily styled/customizable via CSS.
 *
 * Requires SoundManager 2 Javascript API.
 *
 */

function InlinePlayer() {
  var self = this;
  var pl = this;
  var sm = soundManager; // soundManager instance
  var isIE = (navigator.userAgent.match(/msie/i));
  this.playableClass = 'inline-playable'; // CSS class for forcing a link to be playable (eg. doesn't have .MP3 in it)
  this.excludeClass = 'inline-exclude'; // CSS class for ignoring MP3 links
  this.links = [];
  this.sounds = [];
  this.soundsByURL = [];
  this.indexByURL = [];
  this.lastSound = null;
  this.lastSoundTitle = null;
  this.lastSoundId = 0;
  this.soundCount = 0;
  this.currentPosition = 0;
  this.duration = 0;
  this.firstPlaying = true;
  this.wavesurfer = Object.create(WaveSurfer);
  this.wavesurfer.init({
      container: document.querySelector('#audio_channel'), //TODO refactor
      waveColor: 'violet',
      progressColor: 'purple',
      backend: 'AudioElement',
      height: 50
  });
  this.peaks = [
        0.01, 0.02, 0.011, 0.017, 0.016, 0.007, 0.015, 0.01, 0.011,
        0.01, 0.025, 0.013, 0.01, 0.3, 0.3, 0., 0.32, 0.2, 0.2, 0.2, 0.18,
        0.30, 0.1, 0.24, 0.1, 0.2, 0.23, 0.2, 0.23, 0., 0.2, 0.21, 0.23,
        0.25, 0.26, 0.2, 0.28, 0.2, 0.24, 0.22, 0.21, 0.17, 0.25, 0.25,
        0.26, 0.18, 0.22, 0.17, 0.24, 0.22, 0.09, 0.12, 0.2, 0.13, 0.22,
        0.2, 0.20, 0.29, 0.25, 0.31, 0.25, 0.26, 0.20, 0.37, 0.29, 0.,
        0.34, 0.2, 0.26, 0.17, 0.2, 0., 0.29, 0., 0.1, 0.18, 0.29, 0.2,
        0.27, 0.18, 0.19, 0.24, 0.24, 0.21, 0.26, 0.19, 0.18, 0.23, 0.3,
        0.3, 0.3, 0.29, 0.24, 0.3, 0.3, 0.15, 0.1, 0.23, 0.2, 0.23, 0.18,
        0.2, 0.2, 0.30, 0.2, 0.20, 0., 0.29, 0.3, 0.1, 0.14, 0.1, 0.,
        0.27, 0.23, 0.29, 0.18, 0.20, 0.1, 0.3, 0.23, 0.27, 0.19, 0.2,
        0.19, 0.22, 0.19, 0.12, 0.23, 0.21, 0.12, 0.1, 0.1, 0.1, 0.15,
        0.24, 0.1, 0.1, 0.1, 0.1, 0.14, 0.13, 0.10, 0.11, 0.13, 0.1, 0.10,
        0.10, 0.1, 0.14, 0.13, 0.12, 0.1, 0.1, 0.14, 0.13, 0.14, 0.12,
        0.1, 0.12, 0.1, 0.16, 0.1, 0.1, 0.16, 0.15, 0.1, 0.13, 0.15, 0.1,
        0.13, 0.16, 0.15, 0.12, 0.14, 0.13, 0.13, 0.14, 0.13, 0.17, 0.16,
        0.17, 0.14, 0.1, 0.16, 0.1, 0.15, 0.14, 0.08, 0.1, 0.11, 0.1,
        0.09, 0.11, 0.1, 0.11, 0.10, 0.10, 0.11, 0.10, 0.0, 0.08, 0.07,
        0.05, 0.04, 0.023, 0.007, 0.007, 0.007, 0.015, 0.00, 0.008, 0.007,
        0.007, 0.007, 0.007, 0.0, 0.010
    ];

  this.wavesurfer.on('ready', function () {
      self.wavesurfer.play();
  });

  this.config = {
    playNext: false, // stop after one sound, or play through list until end
    autoPlay: false  // start playing the first sound right away
  }

  this.css = {
    // CSS class names appended to link during various states
    sDefault: 'sm2_link', // default state
    sLoading: 'sm2_loading',
    sPlaying: 'sm2_playing',
    sPaused: 'sm2_paused'
  }

  this.addEventHandler = (typeof window.addEventListener !== 'undefined' ? function(o, evtName, evtHandler) {
    return o.addEventListener(evtName,evtHandler,false);
  } : function(o, evtName, evtHandler) {
    o.attachEvent('on'+evtName,evtHandler);
  });

  this.removeEventHandler = (typeof window.removeEventListener !== 'undefined' ? function(o, evtName, evtHandler) {
    return o.removeEventListener(evtName,evtHandler,false);
  } : function(o, evtName, evtHandler) {
    return o.detachEvent('on'+evtName,evtHandler);
  });

  this.msToTimestamp = function(milliseconds) {
    var totalSeconds = Math.round(milliseconds / 1000);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds - minutes * 60;
    if(isNaN(minutes)) {
        minutes = '';
    }
    if(isNaN(seconds)) {
        return '';
    }
    if(seconds < 10) {
        seconds = '0' + seconds;
    }
    return minutes + ':' + seconds;
  }

  this.classContains = function(o,cStr) {
	return (typeof(o.className)!='undefined'?o.className.match(new RegExp('(\\s|^)'+cStr+'(\\s|$)')):false);
  }

  this.addClass = function(o,cStr) {
    if (!o || !cStr || self.classContains(o,cStr)) return false;
    o.className = (o.className?o.className+' ':'')+cStr;
  }

  this.removeClass = function(o,cStr) {
    if (!o || !cStr || !self.classContains(o,cStr)) return false;
    o.className = o.className.replace(new RegExp('( '+cStr+')|('+cStr+')','g'),'');
  }

  this.getSoundByURL = function(sURL) {
    return (typeof self.soundsByURL[sURL] != 'undefined'?self.soundsByURL[sURL]:null);
  }

  this.isChildOfNode = function(o,sNodeName) {
    if (!o || !o.parentNode) {
      return false;
    }
    sNodeName = sNodeName.toLowerCase();
    do {
      o = o.parentNode;
    } while (o && o.parentNode && o.nodeName.toLowerCase() != sNodeName);
    return (o.nodeName.toLowerCase() == sNodeName?o:null);
  }

  this.events = {

    // handlers for sound events as they're started/stopped/played

    play: function() {
      pl.removeClass(this._data.oLink,this._data.className);
      this._data.className = pl.css.sPlaying;
      pl.addClass(this._data.oLink,this._data.className);
    },

    stop: function() {
      pl.removeClass(this._data.oLink,this._data.className);
      this._data.className = '';
    },

    pause: function() {
      pl.removeClass(this._data.oLink,this._data.className);
      this._data.className = pl.css.sPaused;
      pl.addClass(this._data.oLink,this._data.className);
    },

    resume: function() {
      pl.removeClass(this._data.oLink,this._data.className);
      this._data.className = pl.css.sPlaying;
      pl.addClass(this._data.oLink,this._data.className);      
    },

    finish: function() {
      pl.removeClass(this._data.oLink,this._data.className);
      this._data.className = '';
      if (pl.config.playNext) {
        var nextLink = (pl.indexByURL[this._data.oLink.href]+1);
        if (nextLink<pl.links.length) {
          pl.handleClick({'target':pl.links[nextLink]});
        }
      }
    },

    whileplaying: function() {
      var pos = self.msToTimestamp(self.position());
      var duration = self.msToTimestamp(self.lastSound.duration);
      if (pos !== self.currentPosition){
        self.currentPosition = pos;
        document.getElementById('position').innerHTML = pos;        
      }
      if (duration !== self.duration) {
        self.duration = duration;
        document.getElementById('duration').innerHTML = duration;
      }
      var ratio = self.position() / self.lastSound.duration;
      $('#slider').simpleSlider('setRatio', ratio);
    }
  }

  this.seek = function(ratio) {
    var pos = self.lastSound.duration * ratio;
    self.position(pos);
  };

  this.position = function(pos) {
      if(self.lastSound) {
          if(pos || pos === 0) {
              //limit to bounds
              pos = Math.min(self.lastSound.duration, pos);
              pos = Math.max(0, pos);
              //setter
              return self.lastSound.setPosition(pos);
          } else {
              //getter
              return self.lastSound.position;
          }
      } else {
          return 0;
      }
  }

  this.stopEvent = function(e) {
   if (typeof e != 'undefined' && typeof e.preventDefault != 'undefined') {
      e.preventDefault();
    } else if (typeof event != 'undefined' && typeof event.returnValue != 'undefined') {
      event.returnValue = false;
    }
    return false;
  }

  this.getTheDamnLink = (isIE)?function(e) {
    // I really didn't want to have to do this.
    return (e && e.target?e.target:window.event.srcElement);
  }:function(e) {
    return e.target;
  }

  this.handleClick = function(e) {
    // a sound link was clicked
    if (typeof e.button != 'undefined' && e.button>1) {
      // ignore right-click
      return true;
    }
    var o = self.getTheDamnLink(e);
    if (o.nodeName.toLowerCase() != 'a') {
      o = self.isChildOfNode(o,'a');
      if (!o) return true;
    }
    var sURL = o.getAttribute('href');
    if (!o.href || (!sm.canPlayLink(o) && !self.classContains(o,self.playableClass)) || self.classContains(o,self.excludeClass)) {
      return true; // pass-thru for non-MP3/non-links
    }
    var soundURL = (o.href);
    var thisSound = self.getSoundByURL(soundURL);
    if (thisSound) {
      // already exists
      if (thisSound == self.lastSound) {
        // and was playing (or paused)
        thisSound.togglePause();
      } else {
        // different sound
        sm._writeDebug('sound different than last sound: '+self.lastSound.id);
        if (self.lastSound) {
          self.stopSound(self.lastSound);
        }
        thisSound.togglePause(); // start playing current
      }
    } else {
      // stop last sound
      if (self.lastSound) {
        self.stopSound(self.lastSound);
      }
      // create sound
      thisSound = sm.createSound({
       id:'inlineMP3Sound'+(self.soundCount++),
       url:soundURL,
       onplay:self.events.play,
       onstop:self.events.stop,
       onpause:self.events.pause,
       onresume:self.events.resume,
       onfinish:self.events.finish,
       whileplaying:self.events.whileplaying,
       type:(o.type||null)
      });
      // tack on some custom data
      thisSound._data = {
        oLink: o, // DOM node for reference within SM2 object event handlers
        className: self.css.sPlaying
      };
      self.soundsByURL[soundURL] = thisSound;
      self.sounds.push(thisSound);
      thisSound.play();
    }

    self.lastSound = thisSound; // reference for next call
    self.lastSoundTitle = o.innerText || o.textContent;
    // TODO refactor global state
    document.getElementById('music_titile').innerHTML = self.lastSoundTitle;      
    self.lastSoundId = o.getAttribute('data-id');
    self.wavesurfer.load(self.lastSound.url, self.peaks);
    //
    if (self.firstPlaying) {
      document.getElementById('player').className += ' show-up';
      self.firstPlaying = false;
    }
    if (typeof e != 'undefined' && typeof e.preventDefault != 'undefined') {
      e.preventDefault();
    } else {
      event.returnValue = false;
    }
    return false;
  }

  this.stopSound = function(oSound) {
    soundManager.stop(oSound.id);
    soundManager.unload(oSound.id);
  }

  this.init = function() {
    sm._writeDebug('inlinePlayer.init()');
    var oLinks = document.getElementsByTagName('a');
    // grab all links, look for .mp3
    var foundItems = 0;
    for (var i=0, j=oLinks.length; i<j; i++) {
      if ((sm.canPlayLink(oLinks[i]) || self.classContains(oLinks[i],self.playableClass)) && !self.classContains(oLinks[i],self.excludeClass)) {
        self.addClass(oLinks[i],self.css.sDefault); // add default CSS decoration
        self.links[foundItems] = (oLinks[i]);
        self.indexByURL[oLinks[i].href] = foundItems; // hack for indexing
        foundItems++;
      }
    }
    if (foundItems>0) {
      self.addEventHandler(document,'click',self.handleClick);
      if (self.config.autoPlay) {
        self.handleClick({target:self.links[0],preventDefault:function(){}});
      }
    }
    sm._writeDebug('inlinePlayer.init(): Found '+foundItems+' relevant items.');
  }
}

var inlinePlayer = null;

soundManager.setup({
  // disable or enable debug output
  debugMode: false,
  // use HTML5 audio for MP3/MP4, if available
  preferFlash: false,
  useFlashBlock: true,
  // path to directory containing SM2 SWF
  url: '../swf/',
  // optional: enable MPEG-4/AAC support (requires flash 9)
  flashVersion: 9
});

// ----

soundManager.onready(function() {
  // soundManager.createSound() etc. may now be called
  inlinePlayer = new InlinePlayer();
  $('#slider').bind('slider:changed', function (event, data) {
    // has to do it like that because simple slider always bubble the event.
    if(data.trigger === 'domDrag') {
      inlinePlayer.seek(data.ratio);    
    }
  });
});

