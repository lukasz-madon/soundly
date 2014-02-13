### Soundly.io https://soundlyio.herokuapp.com/

### Installation

All python dependencies are specified in requirements.txt and managed with pip using virtualenv

### DB 
1. install postgres with homebrew
1. 'brew install postgressql'
1. follow instructions (/usr/local/opt/postgresql/bin/createuser -s postgres maybe needed to add one superuser)
1. create user dbuser(P@ssw0rd) using superuser postgres
1. http://stackoverflow.com/questions/13784340/how-to-run-postgres-locally

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

### Adding music to video

```ffmpeg -i "http://s3-us-west-2.amazonaws.com/test.co/trailer.wmv" -i "http://s3-us-west-2.amazonaws.com/test.co/jingiel_bacterion_v2.mp3" -map 0:1 -map 1:0 -codec copy ~/Downloads/output.wmv ```

### Gotchas

Inconsistent oauth between google and youtube http://stackoverflow.com/questions/20447149/google-oauth2-login-get-youtube-nickname-and-real-email-address/

when logged in with gmail account
```

{u'family_name': u'Smith', u'name': u'Jhon Smith', u'picture': u'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50', u'locale': u'pl', u'email': u'jhons@gmail.com', u'given_name': u'Jhon', u'id': u'112344912000935801269', u'verified_email': True}
```

when logged in with youtube 

```
{u'picture': u'https://lh3.googleusercontent.com/-q1Smh9d8d0g/AAAAAAAAAAM/AAAAAAAAAAA/3YaY0XeTIPc/photo.jpg?sz=50', u'name': u'AwesomeStudios', u'locale': u'pl', u'email': u'awesomestudios-3347@pages.plusgoogle.com', u'link': u'https://plus.google.com/109358000285879682859', u'id': u'109358000285879682859', u'verified_email': True}
```
