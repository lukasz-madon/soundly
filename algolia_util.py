import os
import json
from algoliasearch import algoliasearch

from models import Music


def export_music():
	client = algoliasearch.Client(os.environ["ALGOLIASEARCH_APPLICATION_ID"], os.environ["ALGOLIASEARCH_API_KEY"]) 
	index = client.initIndex("music")
	batch = []
	for m in Music.query.all():
		obj = {
			"title":  m.title,
			"artist":  m.artist.name,
			"category":  m.category,
			"tag":  m.tag	
		}
		batch.append(obj)
	index.setSettings({"attributesToIndex": ["title", "artist", "category", "tag"]})
	index.addObjects(batch)
	print index.search("ba")
