# coding:utf-8
# used for indexing marco query set to elastic search.
import redis
import json
from elasticsearch import Elasticsearch

ES_HOST = {"host" : "localhost", "port" : 9200}
INDEX_NAME = 'marco_1'
TYPE_NAME = 'qna'

es = Elasticsearch(hosts = [ES_HOST])

request_body = {
    "mappings": {
        "qna": {
            "properties": {
                "query_type": {
                    "default": {
                        "type": "keyword"
                    }
                }
            }
        }
    }
}

if es.indices.exists(INDEX_NAME):
    res = es.indices.delete(INDEX_NAME)
    print(" response: '%s'" % (res))

if not es.indices.exists(INDEX_NAME):
    print("creating '%s' index..." % (INDEX_NAME))
    res = es.indices.create(index = INDEX_NAME,body=request_body)
    print(" response: '%s'" % (res))

data = open("train_v1.1.json",'r')

bulk_size = 5000

bulk = []
i = 0

for line in data:
    doc = json.loads(line)
    op_dict = {
        "index": {
            "_index": INDEX_NAME, 
            "_type": TYPE_NAME 
        }
    }
    bulk.append(op_dict)
    bulk.append(doc)
    i += 1
    if i % bulk_size == 0:
        res = es.bulk(index = INDEX_NAME, body = bulk, refresh = True)
        print(" response for [%s]th bulk: '%s'" % (i/bulk_size,res))
        bulk = []

res = es.bulk(index = INDEX_NAME,body = bulk, refresh = True)
print(" response for last bulk: '%s'" % (res))
