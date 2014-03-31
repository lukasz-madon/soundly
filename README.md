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

### Config

All secret configs e.g. API key are stored in heroku config. locally keep them in ~/.bash_profile (don't forget to `source` console). No sensitive data in git!

bash_profile
```
if [ -f $(brew --prefix)/etc/bash_completion ]; then
    . $(brew --prefix)/etc/bash_completion
fi
export FLASK_SECRET_KEY='the quick brown fox jumps over the lazy dog'
export DEBUG='1'

```
Add config for AWS and Google API

### Adding music to video

```ffmpeg -i "http://s3-us-west-2.amazonaws.com/test.co/trailer.wmv" -i "http://s3-us-west-2.amazonaws.com/test.co/jingiel_bacterion_v2.mp3" -codec copy -y ~/Downloads/output.wmv ```

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

### Gotchas

Some users can have google oAuth but no channel or think they have a channel but it's not merge with oAuth -> don't upload 

Inconsistent oauth between google and youtube http://stackoverflow.com/questions/20447149/google-oauth2-login-get-youtube-nickname-and-real-email-address/


when logged in with gmail account
```

{u'family_name': u'Smith', u'name': u'Jhon Smith', u'picture': u'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50', u'locale': u'pl', u'email': u'jhons@gmail.com', u'given_name': u'Jhon', u'id': u'112344912000935801269', u'verified_email': True}
```

when logged in with youtube 

```
{u'picture': u'https://lh3.googleusercontent.com/-q1Smh9d8d0g/AAAAAAAAAAM/AAAAAAAAAAA/3YaY0XeTIPc/photo.jpg?sz=50', u'name': u'AwesomeStudios', u'locale': u'pl', u'email': u'awesomestudios-3347@pages.plusgoogle.com', u'link': u'https://plus.google.com/109358000285879682859', u'id': u'109358000285879682859', u'verified_email': True}

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
