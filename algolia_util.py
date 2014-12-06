import os
import json
from algoliasearch import algoliasearch

from models import Music


def export_music():
    client = algoliasearch.Client(
        os.environ["ALGOLIASEARCH_APPLICATION_ID"],
        os.environ["ALGOLIASEARCH_API_KEY"])
    index = client.initIndex("music")
    batch = []
    for m in Music.query.all():
        obj = m.to_dict
        obj["artist"] = m.artist.name
        my_dict.pop("artist_id")
        batch.append(obj)
    index.setSettings(
        {"attributesToIndex": ["title", "artist", "category", "tag"]})
    index.addObjects(batch)
