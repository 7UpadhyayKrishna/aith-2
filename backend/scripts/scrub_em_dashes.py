"""One-off: replace em/en dashes with ASCII hyphens in Mongo string fields."""
from pathlib import Path
import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(Path(__file__).resolve().parent.parent / '.env')
client = MongoClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]


def scrub(val):
    if isinstance(val, str):
        if '\u2014' in val or '\u2013' in val:
            return val.replace('\u2014', '-').replace('\u2013', '-'), True
        return val, False
    if isinstance(val, list):
        out, hit = [], False
        for item in val:
            nv, h = scrub(item)
            out.append(nv)
            hit = hit or h
        return out, hit
    if isinstance(val, dict):
        out, hit = {}, False
        for k, v in val.items():
            if k == '_id':
                out[k] = v
                continue
            nv, h = scrub(v)
            out[k] = nv
            hit = hit or h
        return out, hit
    return val, False


def main():
    total = 0
    for name in db.list_collection_names():
        col = db[name]
        updated = 0
        for doc in col.find({}):
            new_doc, hit = scrub(doc)
            if not hit:
                continue
            new_doc.pop('_id', None)
            col.update_one({'_id': doc['_id']}, {'$set': new_doc})
            updated += 1
        if updated:
            print(f'{name}: {updated} docs')
            total += updated
    print(f'total={total}')


if __name__ == '__main__':
    main()
