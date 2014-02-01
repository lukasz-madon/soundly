## Soundly.io https://soundlyio.herokuapp.com/

## Installation

All python dependencies are specified in requirements.txt and managed with pip using virtualenv

#### DB 
1. install postgres with homebrew
1. 'brew install postgressql'
1. follow instructions (/usr/local/opt/postgresql/bin/createuser -s postgres maybe needed to add one superuser)
1. create user dbuser using superuser postgres
1. http://stackoverflow.com/questions/13784340/how-to-run-postgres-locally
1. export db uri (add to ~/.bash_profile)
  `export DATABASE_URL='postgresql+psycopg2://dbuser:P@ssw0rd@localhost/local_db'`
