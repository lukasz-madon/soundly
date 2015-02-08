### Soundly.io https://soundlyio.herokuapp.com/

### Installation

All python dependencies are specified in requirements.txt and managed with pip using virtualenv

### DB
1. install postgres with homebrew (check with heroku tutorial first for changes/diff way)
1. 'brew install postgressql'
1. follow instructions (/usr/local/opt/postgresql/bin/createuser -s postgres maybe needed to add one superuser)
1. create user dbuser(P@ssw0rd) using superuser postgres
1. http://stackoverflow.com/questions/13784340/how-to-run-postgres-locally
1. brew install redis
1. brew install ffmpeg (should be 2.5)

### Config

All secret configs e.g. API key are stored in heroku config. locally keep them in ~/.zshrc (don't forget to `source` console). No sensitive data in git!

```
export FLASK_SECRET_KEY='the quick brown fox jumps over the lazy dog'
export DEBUG='1'
```
Add config for AWS and Google API

### Adding music to video

First version of the app will replace, add, mix music and change volume. Youtube has a few different streams that can be used.
It's not clear if there is one format that will always be present and the app shouldn't depend on that. We need to handle most of the formats:

```
>>> import pafy
>>> url = "https://www.youtube.com/watch?v=bMt47wvK6u0"
>>> video = pafy.new(url)
>>> video.allstreams
[normal:mp4@1280x720, normal:webm@640x360, normal:mp4@640x360, normal:flv@320x240, normal:3gp@320x240, normal:3gp@176x144, video:m4v@1280x720, video:webm@720x480, video:m4v@854x480, video:webm@640x480, video:m4v@640x360, video:webm@480x360, video:m4v@426x240, video:webm@360x240, video:m4v@256x144, audio:m4a@128k, audio:ogg@128k]
```

Pipeline with all possible formats, but we assume mp4 for now.
```
yt-video(mp4, webm, flv, 3gp) + yt-audio() + soundly-mp3 -> output-video-for-youtube

```

```ffmpeg -i "http://s3-us-west-2.amazonaws.com/test.co/trailer.wmv" -i "http://s3-us-west-2.amazonaws.com/test.co/jingiel_bacterion_v2.mp3" -codec copy -y ~/Downloads/output.wmv ```

```
ffmpeg -i jingiel_bacterion_v2.mp3 -i trailer.wmv -filter_complex "[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=0.5[a1];[1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo,volume=0.8[a2];[a1][a2]amerge,pan=stereo:c0<c0+c2:c1<c1+c3[out]" -map 1:v -map "[out]" -c:v copy -shortest out_vid3.wmv
```

```
ffmpeg -i jingiel_bacterion_v2.mp3 -i trailer.wmv  -filter_complex "[0:a]volume=0.390625[a1];[1:a]volume=0.781250[a2];[a1][a2]amerge,pan=stereo:c0<c0+c2:c1<c1+c3[out]" -map 1:v -map "[out]" -c:v copy -c:a libfdk_aac -shortest output.wmv
```

### Architecture

- Redis for worker -> web app queue, caching and storing session
- Postgres for data
- Python for backend (Flask)
- ffmpeg for codecs
- Frontend based on Jinja2 + Bootstrap, Jquery and some js (possibly use of Angular for video/music editor etc)
- hosting heroku (maybe barebone AWS or Digital Ocean)
- DNS and domain gandi.net
- for searching Algolia maybe or elastic search?
- New Relict for performance
- Other add-ons for logging etc
- Move to golang?

### Gotchas

Some users can have google oAuth but no channel or think they have a channel but it's not merge with oAuth -> don't upload

Inconsistent oauth between google and youtube http://stackoverflow.com/questions/20447149/google-oauth2-login-get-youtube-nickname-and-real-email-address/

when logged in with gmail account
```
{u'family_name': u'Smith', u'name': u'Jhon Smith', u'picture': u'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50', u'locale': u'pl', u'email': u'jhons@gmail.com', u'given_name': u'Jhon', u'id': u'112344912000935801268', u'verified_email': True}
```

when logged in with youtube

```
{u'picture': u'https://lh3.googleusercontent.com/-q1Smh9d8d0g/AAAAAAAAAAM/AAAAAAAAAAA/3YaY0XeTIPc/photo.jpg?sz=50', u'name': u'AwesomeStudios', u'locale': u'pl', u'email': u'awesomestudios-3347@pages.plusgoogle.com', u'link': u'https://plus.google.com/109358000285879682859', u'id': u'109358000285879682858', u'verified_email': True}
```
Example credentials
```
{
	'token_expiry': datetime.datetime(2014, 3, 29, 17, 20, 50, 958924),
 	'access_token': u'...zUQ',
 	'token_uri': 'https://accounts.google.com/o/oauth2/token', 
 	'store': None, 
 	'invalid': False, 
 	'token_response': 	{
 		u'access_token': u'ya...Q',
 		u'token_type': u'Bearer',
 		u'expires_in': 3599, 
		u'id_token': 
 		{
 			u'aud': u'845097974070-jl19gphqg5dgg49k7f5dmjtv8af3r35h.apps.googleusercontent.com',
 			u'sub': u'102709671723459182442',
 			u'cid': u'845097974070-jl19gphqg5dgg49k7f5dmjtv8af3r35h.apps.googleusercontent.com',
 			u'iss': u'accounts.google.com',
 			u'email_verified': u'true',
 			u'email': u'stest-2142-0086@pages.plusgoogle.com',
 			u'at_hash': u'JBih7jKCzE6kv0rq4Vjlgg',
 			u'exp': 1396113651,
 			u'azp': u'845097974070-jl19gphqg5dgg49k7f5dmjtv8af3r35h.apps.googleusercontent.com',
 			u'iat': 1396109751,
 			u'token_hash': u'JBih7jKCzE6kv0rq4Vjlgg',
 			u'id': u'102709671723459182442',
 			u'verified_email': u'true'
 		}
 	},
 	'client_id': '845097974070-jl19gphqg5dgg49k7f5dmjtv8af3r35h.apps.googleusercontent.com',
 	'id_token': {
 		u'aud': u'845097974070-jl19gphqg5dgg49k7f5dmjtv8af3r35h.apps.googleusercontent.com',
 		u'sub': u'102709671723459182442',
 		u'cid': u'845097974070-jl19gphqg5dgg49k7f5dmjtv8af3r35h.apps.googleusercontent.com',
 		u'iss': u'accounts.google.com',
 		u'email_verified': u'true',
 		u'email': u'stest-2142-0086@pages.plusgoogle.com', 
 		u'at_hash': u'JBih7jKCzE6kv0rq4Vjlgg', 
 		u'exp': 1396113651, 
 		u'azp': u'845097974070-jl19gphqg5dgg49k7f5dmjtv8af3r35h.apps.googleusercontent.com', 
 		u'iat': 1396109751, 
 		u'token_hash': u'JBih7jKCzE6kv0rq4Vjlgg', 
 		u'id': u'102709671723459182442', 
 		u'verified_email': u'true'
 	}, 
 	'client_secret': 'OPsb9...HM',
 	'revoke_uri': 'https://accounts.google.com/o/oauth2/revoke',
 	'refresh_token': u'1D...on-zcI',
 	'user_agent': None
 }
```
You can get views from youtube data api v2.0 `https://gdata.youtube.com/feeds/api/videos/MSrTnWDTdwI?v=2&alt=json` as json from client side which is nice, but need to store in DB to calculate the price later on.

Youtube categories

```
	<option value="2">Autos &amp; Vehicles</option>
    <option value="23">Comedy</option>
    <option value="27">Education</option>
    <option value="24">Entertainment</option>
    <option value="1">Film &amp; Animation</option>
    <option value="20" selected="">Gaming</option>
    <option value="26">Howto &amp; Style</option>
    <option value="10">Music</option>
    <option value="25">News &amp; Politics</option>
    <option value="29">Nonprofits &amp; Activism</option>
    <option value="22">People &amp; Blogs</option>
    <option value="15">Pets &amp; Animals</option>
    <option value="28">Science &amp; Technology</option>
    <option value="17">Sports</option>
    <option value="19">Travel &amp; Events</option>
```

## ffmpeg version (local)
```
(venv)➜  soundly git:(master) ffmpeg -version
ffmpeg version 2.5 Copyright (c) 2000-2014 the FFmpeg developers
built on Dec  8 2014 10:02:02 with llvm-gcc 4.2.1 (LLVM build 2336.11.00)
configuration: --prefix=/Volumes/Ramdisk/sw --enable-gpl --enable-pthreads --enable-version3 --enable-libspeex --enable-libvpx --disable-decoder=libvpx --enable-libmp3lame --enable-libtheora --enable-libvorbis --enable-libx264 --enable-avfilter --enable-libopencore_amrwb --enable-libopencore_amrnb --enable-filters --enable-libgsm --enable-libvidstab --enable-libx265 --arch=x86_64 --enable-runtime-cpudetect
libavutil      54. 15.100 / 54. 15.100
libavcodec     56. 13.100 / 56. 13.100
libavformat    56. 15.102 / 56. 15.102
libavdevice    56.  3.100 / 56.  3.100
libavfilter     5.  2.103 /  5.  2.103
libswscale      3.  1.101 /  3.  1.101
libswresample   1.  1.100 /  1.  1.100
libpostproc    53.  3.100 / 53.  3.100
```

Bulding ffmpeg on heroku
https://discussion.heroku.com/t/opencv-and-statically-compiled-python/105/2

## ffmpeg version (heroku)
```
ffmpeg version git-2015-02-07-29fd303 Copyright (c) 2000-2015 the FFmpeg developers
  built with gcc 4.4.3 (Ubuntu 4.4.3-4ubuntu5.1)
  configuration: --enable-shared --disable-asm --prefix=/app/vendor/ffmpeg
  libavutil      54. 18.100 / 54. 18.100
  libavcodec     56. 21.102 / 56. 21.102
  libavformat    56. 19.100 / 56. 19.100
  libavdevice    56.  4.100 / 56.  4.100
  libavfilter     5.  9.103 /  5.  9.103
  libswscale      3.  1.101 /  3.  1.101
  libswresample   1.  1.100 /  1.  1.100
Hyper fast Audio and Video encoder
```
