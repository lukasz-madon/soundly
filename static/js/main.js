// isolate later on with amd or whatever
swfobject.embedSWF('http://www.youtube.com/v/' + Soundly.current_video.id + 
  '?enablejsapi=1&playerapiid=ytplayer&version=3', 'ytapiplayer', '100%', '400', '8', null, null
  , { allowScriptAccess: 'always' }, { id: 'myytplayer' });

function onYouTubePlayerReady(playerId) {
    ytplayer = document.getElementById("myytplayer");
    ytplayer.setVolume(0);
    ytplayer.addEventListener("onStateChange", "onytplayerStateChange");
    
};
function onytplayerStateChange(newState) {
  if (newState === 1) { // playing
  }
}
$(document).ready(function() {
  $('#title').val(Soundly.current_video.title);
  $('#description').val(Soundly.current_video.description);
  $("#override_audio").bind("slider:changed", function (event, data) {
    Soundly.current_audio.volume = data.value;
    if(data.value < 0.9) {
      $('#override_audio_desc').text("Music & original.")
    } else {
      $('#override_audio_desc').text("Just Music.")
    }
    ytplayer.setVolume(100 - data.value * 100); 
  });

  var waveform = new Waveform({
    container: document.getElementById('audio_channel'),
    data: [0.01, 0.02, 0.011, 0.017, 0.016, 0.007, 0.015, 0.01, 0.011,
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
        0.007, 0.007, 0.007, 0.0, 0.010],
    innerColor: '#3B8686',
    height: 50
  });

  var client = new AlgoliaSearch(Soundly.Algolia.app_id, Soundly.Algolia.api_key);
  var index = client.initIndex('music');
  var $hits = $('#player-grid');
  // validation on DB side so no XSS
  function searchCallback(success, content) {
    if (!success || $('#q').val() != content.query) {
      return;
    }
    var html = '';
    for (var i = 0; i < content.hits.length; ++i) {
      var hit = content.hits[i];
      html += '<div class="player-item  col-xs-12 col-sm-4">' +
                '<a class="thumbnail" href="' + hit.url + '" data-id="' + hit.id + '"">' +
                '<div class="row">' +
                  '<div class="col-xs-2"><i class="fa"></i></div>' +
                  '<div class="col-xs-10 txt text-right">' + 
                  hit._highlightResult.artist.value + '<br>' +
                  '<strong>' + hit._highlightResult.title.value + '</strong><br>' + 
                  '<small class="text-muted">#' + hit._highlightResult.tag.value + '</small>' +
                  '</div>' +
                '</div>' +
                '</a>' +
              '</div>'
    }
    $hits.html(html);
    inlinePlayer.init();
  }
  $('#q').keyup(function() {
    index.search($(this).val(), searchCallback, { hitsPerPage: 30 });
  }).trigger('keyup').focus();

  $('#publish').click(function(){
    if (inlinePlayer.lastSound === null) {
      alert('First, pick the best music.');
      return;
    }
    var data = { 
      title: $('#title').val(),   //TODO validation here as well? No problem with XSS right now 
      description: $('#description').val(),
      video_id: Soundly.current_video.id,
      music_id: inlinePlayer.lastSoundId,  
      music_url: inlinePlayer.lastSound.url,
      override_audio: $("#audio_override").val(),
      privacy_status: $("#privacyStatus option:selected").text()
    };
    $.ajax('process-video', {
      data : JSON.stringify(data),
      contentType : 'application/json',
      type : 'POST'
    });
    // Just for fun :)
    if(Math.random() < 0.5) {
      $('#ok').html('Your video will be on your channel shortly.<br> <img class="img-responsive" src="http://d24w6bsrhbeh9d.cloudfront.net/photo/a44rgWQ_460sa.gif">');
    } else {
      $('#ok').html('Your video will be available on your channel shortly.<br> <img class="img-responsive" src="http://wearesocialmedia.gr/wp-content/uploads/2013/11/3879-animated_gif-chuck_norris-dodgeball-thumbs_up.gif">');
    }
    $('#ok').append('<small>Try <a href="http://flapmmo.com/" target="_blank"> Flappy Bird MMO </a></small>');
      
  });
  $('.video-link').click(function() {
    inlinePlayer.stopSound();
    var video_id = $(this).data('id');
    ytplayer.loadVideoById(video_id);
    Soundly.current_video.id = video_id;
    $('.video-link').removeClass('active');
    $(this).addClass('active');
    $('#title').val($(this).text());
    $('#description').val($(this).data('description'));
  });
});