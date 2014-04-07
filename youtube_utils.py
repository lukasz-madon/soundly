import os, time
import subprocess as sp
from random import random
from urlparse import urlsplit

from flask import jsonify
import httplib
import httplib2
from apiclient.errors import HttpError
from apiclient.http import MediaFileUpload
from apiclient.discovery import build
from werkzeug.utils import secure_filename
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import settings
from models import Music, Video

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
Session = sessionmaker(bind=engine)    
session = Session()
session._model_changes = {}


youtube_service = build("youtube", "v3")
# Explicitly tell the underlying HTTP transport library not to retry, since
# we are handling retry logic ourselves.
httplib2.RETRIES = 1

# Maximum number of times to retry before giving up.
MAX_RETRIES = 10

# Always retry when these exceptions are raised.
RETRIABLE_EXCEPTIONS = (httplib2.HttpLib2Error, IOError, httplib.NotConnected,
  httplib.IncompleteRead, httplib.ImproperConnectionState,
  httplib.CannotSendRequest, httplib.CannotSendHeader,
  httplib.ResponseNotReady, httplib.BadStatusLine)

# Always retry when an apiclient.errors.HttpError with one of these status
# codes is raised.
RETRIABLE_STATUS_CODES = [500, 502, 503, 504]

def resumable_upload(insert_request, title, music_id, user_id):
    print "Started uploading: %s", (title,)
    response = None
    error = None
    retry = 0
    while response is None:
        try:
            status, response = insert_request.next_chunk()
            if "id" in response:
                v = Video(title=title, url="https://www.youtube.com/watch?v=" + response["id"])
                v.user_id = user_id
                v.music = [session.query(Music).get(music_id)]
                session.add(v)
                session.commit()
                print "%s (video id: %s) was successfully uploaded." % (title, response["id"])
            else:
                print "The upload failed with an unexpected response: %s" % (response,)
        except HttpError, e:
            if e.resp.status in RETRIABLE_STATUS_CODES:
                error = "A retriable HTTP error %d occurred:\n%s" % (e.resp.status, e.content)
            else:
                raise
        except RETRIABLE_EXCEPTIONS, e:
            error = "A retriable error occurred: %s" % e
    if error is not None:
        print error
        retry += 1
        if retry > MAX_RETRIES:
            return "MAX_RETRIES"
        max_sleep = 2 ** retry
        sleep_seconds = random() * max_sleep
        print "Sleeping %f seconds and then retrying..." % sleep_seconds
        time.sleep(sleep_seconds)

def process_video_request(credentials , video_url, music_url, music_id, user_id):
    video_path = os.path.basename(urlsplit(video_url)[2])
    base, ext = os.path.splitext(video_path)
    title = base.split("-")[1]
    output_video = secure_filename(video_path)
    # check how to hande all corner cases for input audio streams
    # code = sp.call(["ffmpeg", "-i", video_url, "-i", music_url, "-map", "0:1", 
    #               "-map", "1:0", "-codec", "copy", "-y", output_video])
    code = sp.call(["ffmpeg", "-i", music_url, "-i", video_url, "-codec", "copy", "-y", output_video])
    # TODO refactor for loggin or returning error to webdyno (redis?)
    if code:
        print "error -cannot encode the file"
    insert_request = youtube_service.videos().insert(
        part="snippet,status",
        body=dict(
          snippet=dict(
            title=title,
            description="Music provided by http://soundly.io",
            tags=["trailer","soundly.io"],
            categoryId="20" # seems to be gaming for now
          ),
          status = dict(
            privacyStatus="public"
          )
        ),
        media_body=MediaFileUpload(output_video, chunksize=-1, resumable=True)
    )
    insert_request.http = credentials.authorize(httplib2.Http())
    res = resumable_upload(insert_request, title, music_id, user_id)
