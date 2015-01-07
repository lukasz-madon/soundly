import os
import time
import subprocess as sp
from random import random
from urlparse import urlsplit
import logging
import sys

from flask import jsonify
import httplib
import httplib2
from apiclient.errors import HttpError
from apiclient.http import MediaFileUpload
from apiclient.discovery import build
from werkzeug.utils import secure_filename
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pafy

import settings
from models import Music, Video


logger = logging.getLogger(__name__)

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
Session = sessionmaker(bind=engine)
session = Session()
session._model_changes = {}

youtube_service = build("youtube", "v3")
# Explicitly tell the underlying HTTP transport library not to retry, since
# we are handling retry logic ourselves.
httplib2.RETRIES = 1

# Maximum number of times to retry before giving up.
MAX_RETRIES = 8

# Always retry when these exceptions are raised.
RETRIABLE_EXCEPTIONS = (
    httplib2.HttpLib2Error,
    IOError,
    httplib.NotConnected,
    httplib.IncompleteRead,
    httplib.ImproperConnectionState,
    httplib.CannotSendRequest,
    httplib.CannotSendHeader,
    httplib.ResponseNotReady,
    httplib.BadStatusLine)

# Always retry when an apiclient.errors.HttpError with one of these status
# codes is raised.
RETRIABLE_STATUS_CODES = [500, 502, 503, 504]


class VideoMeta(object):
    """represents video object metadata"""
    def __init__(self, youtube_id, title, description, privacy_status):
        self.id = youtube_id
        self.title = title
        self.description = description
        self.privacy_status = privacy_status

    def __repr__(self):
        return "%s %s;%s;%s" %(self.id, self.title, self.description, self.privacy_status)


def process_video_request(
        credentials, video_id, music_url, music_id, user_id,
        title, description, tags, categoryId, privacyStatus, override_audio
    ):
    """ processing video using ffmpeg """
    # TODO test all cases.
    best_video = pafy.new(video_id).getbest(preftype="mp4")
    video_url = best_video.url
    output_video = secure_filename("%s.%s" % (video_id, best_video.extension))
    # base, ext = os.path.splitext(video_path)
    # check how to hande all corner cases for input audio streams
    # c = sp.call(["ffmpeg", "-i", video_url, "-i", music_url, "-map", "0:1",
    #               "-map", "1:0", "-codec", "copy", "-y", output_video])
    if override_audio > 0.9: # temp. need to add volume
        o_cmd = ["ffmpeg", "-i", music_url, "-i", video_url, "-codec", "copy",
         "-y", "-shortest", output_video]
        logger.info(o_cmd)
        code = sp.call(o_cmd)
    else:
        cmd = ["ffmpeg", "-i", music_url, "-i", video_url, "-filter_complex",
        "amix=duration=shortest", "-vcodec", "copy", "-y", "-shortest", "-strict -2",
        output_video]
        logger.info(cmd)
        code = sp.call(cmd)
    # TODO need better error informations (redis? field in table next to video)
    if code:
        logger.error("error - cannot encode the file")
        return
    insert_request = youtube_service.videos().insert(
        part="snippet,status",
        body=dict(
            snippet=dict(
                title=title,
                description=description,
                tags=tags,
                categoryId=categoryId
            ),
            status=dict(
                privacyStatus=privacyStatus
            )
        ),
        media_body=MediaFileUpload(output_video, chunksize=-1, resumable=True)
    )
    insert_request.http = credentials.authorize(httplib2.Http())
    try:
        res = resumable_upload(insert_request, title, music_id, user_id)
    finally:
        os.remove(output_video)


# from google example.
def resumable_upload(insert_request, title, music_id, user_id):
    logger.info("Job for user %d. Started uploading: %s", user_id, title)
    response = None
    error = None
    retry = 0
    while response is None:
        try:
            status, response = insert_request.next_chunk()
            if "id" in response:
                v = Video(
                    title=title,
                    url="https://www.youtube.com/watch?v=" +
                    response["id"])
                v.user_id = user_id
                v.music = [session.query(Music).get(music_id)]
                session.add(v)
                session.commit()
                logger.info(
                    "Successfully uploaded %s (video id: %s)",
                    title,
                    response["id"])
            else:
                logger.error(
                    "The upload failed with an unexpected response: %s",
                    response)
        except HttpError as e:
            if e.resp.status in RETRIABLE_STATUS_CODES:
                error = "A retriable HTTP error %d occurred:\n%s" % (
                    e.resp.status, e.content)
            else:
                raise
        except RETRIABLE_EXCEPTIONS as e:
            error = "A retriable error occurred: %s" % e

    if error:
        logger.error(error)
        retry += 1
        if retry > MAX_RETRIES:
            logger.error("MAX_RETRIES")
            return
        max_sleep = 2 ** retry
        sleep_seconds = random() * max_sleep
        logger.warning(
            "Sleeping %f seconds and then retrying...",
            sleep_seconds)
        time.sleep(sleep_seconds)
