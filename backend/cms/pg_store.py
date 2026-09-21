"""
Postgres JSONB document store with a Motor/PyMongo-shaped API.

Each former Mongo collection is a table: id TEXT PK + data JSONB.
Documents keep camelCase keys so existing serializers/routers stay intact.
"""
from __future__ import annotations

import json
import logging
import re
from copy import deepcopy
from datetime import datetime
from typing import Any, AsyncIterator, Optional, Sequence
from urllib.parse import urlparse

import asyncpg

logger = logging.getLogger(__name__)

TABLES = frozenset({
    'admin_users',
    'admin_sessions',
    'admin_audit_logs',
    'blogs',
    'blog_revisions',
    'blog_redirects',
    'contact_submissions',
    'quote_submissions',
    'career_submissions',
    'job_postings',
    'ops_activity',
    'ops_notes',
    'ops_messages',
})

_IDENT = re.compile(r'^[A-Za-z_][A-Za-z0-9_]*$')


def _json_default(obj: Any) -> Any:
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, (set, frozenset)):
        return list(obj)
    raise TypeError(f'Object of type {type(obj).__name__} is not JSON serializable')


def _dumps(obj: Any) -> str:
    return json.dumps(obj, default=_json_default)


def normalize_database_url(url: str) -> str:
    """asyncpg accepts postgresql://; strip SQLAlchemy-style driver suffixes."""
    u = (url or '').strip()
    if not u:
        raise ValueError('DATABASE_URL is empty')
    if u.startswith('postgres://'):
        u = 'postgresql://' + u[len('postgres://'):]
    if u.startswith('postgresql+asyncpg://'):
        u = 'postgresql://' + u[len('postgresql+asyncpg://'):]
    if u.startswith('postgresql+psycopg://'):
        u = 'postgresql://' + u[len('postgresql+psycopg://'):]
    return u


def parse_database_url(url: str) -> dict[str, Any]:
    """
    Parse DATABASE_URL without breaking on passwords that contain '@'.

    Splits credentials on the *last* '@' before host. Percent-decodes user/password.
    """
    from urllib.parse import unquote

    u = normalize_database_url(url)
    if '://' not in u:
        raise ValueError('DATABASE_URL must include a scheme (postgresql://…)')
    scheme, rest = u.split('://', 1)
    if scheme not in ('postgresql', 'postgres'):
        raise ValueError(f'Unsupported DATABASE_URL scheme: {scheme}')
    if '@' not in rest:
        raise ValueError('DATABASE_URL must include user@host')
    creds, hostpart = rest.rsplit('@', 1)
    if ':' in creds:
        user, password = creds.split(':', 1)
    else:
        user, password = creds, ''
    user = unquote(user)
    password = unquote(password)

    path = '/postgres'
    query = ''
    if '?' in hostpart:
        hostpart, query = hostpart.split('?', 1)
    if '/' in hostpart:
        hostport, path = hostpart.split('/', 1)
        path = '/' + path
    else:
        hostport = hostpart

    host = hostport
    port = 5432
    if hostport.startswith('[') and ']' in hostport:
        # IPv6 literal
        end = hostport.index(']')
        host = hostport[1:end]
        rem = hostport[end + 1 :]
        if rem.startswith(':'):
            port = int(rem[1:] or 5432)
    elif hostport.count(':') == 1:
        host, port_s = hostport.split(':', 1)
        port = int(port_s or 5432)

    database = path.lstrip('/') or 'postgres'
    if '/' in database:
        database = database.split('/', 1)[0]

    return {
        'user': user,
        'password': password,
        'host': host,
        'port': port,
        'database': database,
        'query': query,
    }


def _ssl_context_for_url(dsn: str):
    """
    Build SSL context for Postgres.

    Production: TLS required (never plaintext). Prefer DATABASE_SSL=verify when the
    host CA is trusted; otherwise use require/insecure (encrypt, no CA verify).
    Local Supabase: default encrypt-without-verify when trust store is incomplete.
    """
    import os
    import ssl

    parts = parse_database_url(dsn)
    host = (parts['host'] or '').lower()
    mode = (os.environ.get('DATABASE_SSL') or '').strip().lower()
    is_prod = (os.environ.get('APP_ENV') or '').strip().lower() == 'production'
    is_supabase = 'supabase.co' in host or 'pooler.supabase.com' in host

    if mode in ('disable', 'false', '0', 'off'):
        if is_prod:
            raise RuntimeError(
                'DATABASE_SSL=disable is forbidden when APP_ENV=production. '
                'Use require (encrypt) or verify (encrypt + CA check).'
            )
        return False

    ctx = ssl.create_default_context()
    if mode == 'verify':
        return ctx

    # encrypt without CA verify: explicit require/insecure, or default for Supabase
    # when DATABASE_SSL is unset (Windows/local CA gaps are common).
    encrypt_no_verify = mode in ('insecure', 'no-verify', 'require') or (not mode and is_supabase)
    if encrypt_no_verify:
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        if is_prod and mode != 'require':
            logger.warning(
                'DATABASE_SSL: production TLS without certificate verification. '
                'Set DATABASE_SSL=verify once the runtime CA trusts the server certificate.'
            )
        elif is_supabase and mode != 'require':
            logger.warning(
                'DATABASE_SSL: using TLS without certificate verification for Supabase. '
                'Set DATABASE_SSL=verify once your CA store trusts the server certificate.'
            )
        return ctx

    # Unset + non-Supabase: full verify
    return ctx


def rewrite_supabase_dsn_if_needed(dsn: str) -> str:
    """
    Prefer Session pooler for Railway/Render (IPv4-friendly).

    - If DATABASE_POOLER_HOST is set, rewrite db.<ref> → pooler with user postgres.<ref>.
    - If URL already uses pooler but user is bare `postgres`, upgrade to postgres.<ref>
      when SUPABASE_PROJECT_REF or ref can be inferred.
    - In production, warn when still on direct db.<ref>.supabase.co (IPv6-only risk).
    """
    import os
    from urllib.parse import quote

    parts = parse_database_url(dsn)
    host = (parts['host'] or '').lower()
    is_prod = (os.environ.get('APP_ENV') or '').strip().lower() == 'production'
    pooler = (os.environ.get('DATABASE_POOLER_HOST') or '').strip()
    env_ref = (os.environ.get('SUPABASE_PROJECT_REF') or '').strip()

    m = re.match(r'^db\.([a-z0-9]+)\.supabase\.co$', host)
    ref = m.group(1) if m else env_ref
    if not ref and parts['user'].startswith('postgres.') and len(parts['user']) > 9:
        ref = parts['user'].split('.', 1)[1]

    def _build(host_out: str, user_out: str) -> str:
        auth = f"{quote(user_out, safe='')}:{quote(parts['password'] or '', safe='')}"
        return f"postgresql://{auth}@{host_out}:{parts['port']}/{parts['database']}"

    if 'pooler.supabase.com' in host:
        user = parts['user'] or 'postgres'
        if ref and not user.startswith('postgres.'):
            user = f'postgres.{ref}'
            logger.info('Pooler username upgraded to postgres.<ref>')
            return _build(host, user)
        return dsn

    if not pooler:
        if is_prod and m:
            logger.warning(
                'DATABASE_URL uses direct db.*.supabase.co. Prefer Session pooler '
                '(*.pooler.supabase.com) or set DATABASE_POOLER_HOST for IPv4 hosts.'
            )
        return dsn

    if not m and not ref:
        logger.warning(
            'DATABASE_POOLER_HOST is set but project ref could not be inferred; '
            'set SUPABASE_PROJECT_REF or use a db.<ref>.supabase.co DATABASE_URL.'
        )
        return dsn

    if not ref and m:
        ref = m.group(1)
    user = parts['user'] or 'postgres'
    if not user.startswith('postgres.'):
        user = f'postgres.{ref}'
    rewritten = _build(pooler, user)
    logger.info('DATABASE_URL rewritten to Session pooler host %s', pooler)
    return rewritten


def _pool_limits() -> tuple[int, int]:
    """Cap pool size for Supabase free/pro connection budgets."""
    import os

    def _int(name: str, default: int) -> int:
        raw = (os.environ.get(name) or '').strip()
        if not raw:
            return default
        try:
            return max(1, int(raw))
        except ValueError:
            return default

    # Supabase free ≈ 60 conn; session pooler shares; keep app pools small.
    min_size = _int('DATABASE_POOL_MIN', 1)
    max_size = _int('DATABASE_POOL_MAX', 5)
    if max_size < min_size:
        max_size = min_size
    if max_size > 15:
        logger.warning('DATABASE_POOL_MAX=%s is high for Supabase; capping at 15', max_size)
        max_size = 15
    return min_size, max_size


async def create_pool(database_url: str, *, min_size: int | None = None, max_size: int | None = None) -> asyncpg.Pool:
    # Pass host/user/password kwargs — DSN strings break when the password contains '@'.
    dsn = rewrite_supabase_dsn_if_needed(normalize_database_url(database_url))
    parts = parse_database_url(dsn)
    ssl_ctx = _ssl_context_for_url(dsn)
    env_min, env_max = _pool_limits()
    min_size = env_min if min_size is None else min_size
    max_size = env_max if max_size is None else max_size
    return await asyncpg.create_pool(
        host=parts['host'],
        port=parts['port'],
        user=parts['user'],
        password=parts['password'],
        database=parts['database'],
        min_size=min_size,
        max_size=max_size,
        ssl=ssl_ctx,
        command_timeout=60,
        init=_init_connection,
    )


def _json_path(field: str) -> tuple[str, list[str]]:
    """Return (sql_text_expr, path_parts) for a dotted field on data JSONB."""
    parts = field.split('.')
    for p in parts:
        if not p or p.startswith('$'):
            raise ValueError(f'Invalid field path: {field}')
    # data #>> '{a,b}'
    literal = '{' + ','.join(parts) + '}'
    return f"(data #>> '{literal}')", parts


def _project(doc: dict, projection: Optional[dict]) -> dict:
    if not projection:
        out = {k: v for k, v in doc.items() if k != '_id'}
        return out
    include = {k: v for k, v in projection.items() if v and k != '_id'}
    exclude = {k for k, v in projection.items() if not v and k != '_id'}
    if include:
        out: dict[str, Any] = {}
        for key in include:
            if '.' in key:
                # nested exclude only supported as strip after copy
                continue
            if key in doc:
                out[key] = doc[key]
        # If only exclusions mixed with includes of 0 for nested — handle exclusions on full doc
        if not out and exclude:
            out = deepcopy(doc)
            out.pop('_id', None)
            for key in exclude:
                _unset_path(out, key)
            return out
        out.pop('_id', None)
        return out
    out = deepcopy(doc)
    out.pop('_id', None)
    for key in exclude:
        _unset_path(out, key)
    return out


def _unset_path(doc: dict, path: str) -> None:
    parts = path.split('.')
    cur: Any = doc
    for p in parts[:-1]:
        if not isinstance(cur, dict) or p not in cur:
            return
        cur = cur[p]
    if isinstance(cur, dict):
        cur.pop(parts[-1], None)


def _match_doc(doc: dict, filt: dict) -> bool:
    """Python-side filter for operators not pushed fully to SQL (safety net / complex)."""
    if not filt:
        return True
    if '$and' in filt:
        return all(_match_doc(doc, p) for p in filt['$and'])
    if '$or' in filt:
        return any(_match_doc(doc, p) for p in filt['$or'])
    for key, expected in filt.items():
        if key.startswith('$'):
            continue
        actual = _get_path(doc, key)
        if isinstance(expected, dict) and any(k.startswith('$') for k in expected):
            if '$regex' in expected:
                flags = re.I if 'i' in str(expected.get('$options') or '') else 0
                if not re.search(str(expected['$regex']), str(actual or ''), flags):
                    return False
            for op, val in expected.items():
                if op in ('$regex', '$options'):
                    continue
                if op == '$ne':
                    if actual == val:
                        return False
                elif op == '$lte':
                    if actual is None or actual > val:
                        return False
                elif op == '$gte':
                    if actual is None or actual < val:
                        return False
                elif op == '$in':
                    if actual not in val:
                        return False
                elif op == '$nin':
                    if actual in val:
                        return False
                elif op == '$exists':
                    exists = _path_exists(doc, key)
                    if bool(val) != exists:
                        return False
                else:
                    return False
        else:
            # Array contains (Mongo: { tags: "x" } matches if x in tags)
            if isinstance(actual, list):
                if expected not in actual:
                    return False
            elif actual != expected:
                return False
    return True


def _get_path(doc: dict, path: str) -> Any:
    cur: Any = doc
    for p in path.split('.'):
        if not isinstance(cur, dict):
            return None
        cur = cur.get(p)
    return cur


def _path_exists(doc: dict, path: str) -> bool:
    cur: Any = doc
    parts = path.split('.')
    for i, p in enumerate(parts):
        if not isinstance(cur, dict) or p not in cur:
            return False
        cur = cur[p]
    return True


def _apply_update(doc: dict, update: dict) -> dict:
    out = deepcopy(doc)
    if '$set' in update:
        for k, v in update['$set'].items():
            _set_path(out, k, v)
    if '$addToSet' in update:
        for k, v in update['$addToSet'].items():
            cur = _get_path(out, k)
            if cur is None:
                _set_path(out, k, [v])
            elif isinstance(cur, list):
                if v not in cur:
                    cur.append(v)
            else:
                _set_path(out, k, [v])
    # bare replace (no operators) — caller uses replace_one
    if not any(k.startswith('$') for k in update):
        out = deepcopy(update)
        if 'id' in doc and 'id' not in out:
            out['id'] = doc['id']
    return out


def _set_path(doc: dict, path: str, value: Any) -> None:
    parts = path.split('.')
    cur = doc
    for p in parts[:-1]:
        if p not in cur or not isinstance(cur[p], dict):
            cur[p] = {}
        cur = cur[p]
    cur[parts[-1]] = value


class UpdateResult:
    def __init__(self, matched: int = 0, modified: int = 0):
        self.matched_count = matched
        self.modified_count = modified
        self.deleted_count = matched  # for delete_* API parity with PyMongo


class InsertOneResult:
    def __init__(self, inserted_id: str):
        self.inserted_id = inserted_id


class Cursor:
    def __init__(
        self,
        collection: 'Collection',
        filt: dict,
        projection: Optional[dict] = None,
    ):
        self._collection = collection
        self._filt = filt or {}
        self._projection = projection
        self._sort: Optional[list[tuple[str, int]]] = None
        self._skip = 0
        self._limit: Optional[int] = None

    def sort(self, key_or_list: Any, direction: Optional[int] = None) -> 'Cursor':
        if isinstance(key_or_list, list):
            self._sort = [(str(k), int(d)) for k, d in key_or_list]
        elif isinstance(key_or_list, tuple) and direction is None and len(key_or_list) == 2:
            self._sort = [(str(key_or_list[0]), int(key_or_list[1]))]
        else:
            self._sort = [(str(key_or_list), int(direction if direction is not None else 1))]
        return self

    def skip(self, n: int) -> 'Cursor':
        self._skip = max(0, int(n))
        return self

    def limit(self, n: int) -> 'Cursor':
        self._limit = max(0, int(n))
        return self

    async def _fetch(self) -> list[dict]:
        docs = await self._collection._find_all(self._filt)
        if self._sort:
            for field, direction in reversed(self._sort):
                reverse = direction < 0

                def sort_key(d: dict, f: str = field):
                    v = _get_path(d, f)
                    return (v is None, v if v is not None else '')

                docs.sort(key=sort_key, reverse=reverse)
        if self._skip:
            docs = docs[self._skip :]
        if self._limit is not None:
            docs = docs[: self._limit]
        return [_project(d, self._projection) for d in docs]

    def __aiter__(self) -> AsyncIterator[dict]:
        async def gen():
            for d in await self._fetch():
                yield d

        return gen()


class Collection:
    def __init__(self, db: 'Database', name: str):
        if name not in TABLES:
            raise AttributeError(f'Unknown collection: {name}')
        if not _IDENT.match(name):
            raise ValueError(f'Invalid table name: {name}')
        self.db = db
        self.name = name

    async def _conn(self) -> asyncpg.Connection:
        return await self.db.pool.acquire()

    async def _find_all(self, filt: dict) -> list[dict]:
        """Load candidates; apply remaining match in Python for full Mongo parity."""
        pool = self.db.pool
        # Fast path: empty filter
        if not filt:
            rows = await pool.fetch(f'SELECT data FROM {self.name}')
            return [dict(r['data']) for r in rows]

        # Fast path: equality on id
        if set(filt.keys()) == {'id'} and not isinstance(filt['id'], dict):
            row = await pool.fetchrow(
                f'SELECT data FROM {self.name} WHERE id = $1',
                str(filt['id']),
            )
            return [dict(row['data'])] if row else []

        # Broad fetch then Python filter — OK for CMS scale (hundreds–thousands of docs)
        # Push simple top-level equality when possible to reduce rows.
        sql, args = self._simple_sql_filter(filt)
        if sql:
            rows = await pool.fetch(f'SELECT data FROM {self.name} WHERE {sql}', *args)
            docs = [dict(r['data']) for r in rows]
        else:
            rows = await pool.fetch(f'SELECT data FROM {self.name}')
            docs = [dict(r['data']) for r in rows]
        return [d for d in docs if _match_doc(d, filt)]

    # Scalar fields safe to push as text equality (not arrays / objects)
    _SQL_EQ_FIELDS = frozenset({
        'id', 'email', 'slug', 'sessionHash', 'userId', 'fromSlug', 'toSlug',
        'status', 'action', 'blogId', 'adminUserId', 'resourceType', 'resourceId',
        'result', 'internalStatus', 'kind',
    })

    def _simple_sql_filter(self, filt: dict) -> tuple[Optional[str], list[Any]]:
        """Push simple equality / $in on known scalar fields. Else full scan + Python match."""
        if any(k in filt for k in ('$and', '$or')):
            return None, []
        clauses: list[str] = []
        args: list[Any] = []
        for key, expected in filt.items():
            if key.startswith('$') or '.' in key:
                return None, []
            if key not in self._SQL_EQ_FIELDS and not (
                isinstance(expected, dict) and set(expected.keys()) <= {'$ne', '$in'}
            ):
                # tags / nested / unknown — do not push incorrect SQL
                if key not in self._SQL_EQ_FIELDS:
                    return None, []
            if isinstance(expected, dict):
                if set(expected.keys()) == {'$in'}:
                    if key == 'id':
                        args.append([str(x) for x in expected['$in']])
                        clauses.append(f'id = ANY(${len(args)}::text[])')
                    else:
                        args.append([str(x) for x in expected['$in']])
                        expr, _ = _json_path(key)
                        clauses.append(f'{expr} = ANY(${len(args)}::text[])')
                elif set(expected.keys()) == {'$ne'}:
                    val = expected['$ne']
                    if key == 'id':
                        args.append(str(val))
                        clauses.append(f'id IS DISTINCT FROM ${len(args)}')
                    else:
                        args.append(None if val is None else str(val))
                        expr, _ = _json_path(key)
                        clauses.append(f'({expr} IS DISTINCT FROM ${len(args)}::text)')
                else:
                    return None, []
            else:
                if key not in self._SQL_EQ_FIELDS:
                    return None, []
                args.append(str(expected).lower() if key == 'email' else str(expected))
                if key == 'id':
                    clauses.append(f'id = ${len(args)}')
                elif key == 'email':
                    clauses.append(f'lower(data->>\'email\') = ${len(args)}')
                else:
                    expr, _ = _json_path(key)
                    clauses.append(f'{expr} = ${len(args)}')
        if not clauses:
            return None, []
        return ' AND '.join(clauses), args

    async def find_one(self, filt: Optional[dict] = None, projection: Optional[dict] = None) -> Optional[dict]:
        docs = await self._find_all(filt or {})
        if not docs:
            return None
        return _project(docs[0], projection)

    def find(self, filt: Optional[dict] = None, projection: Optional[dict] = None) -> Cursor:
        return Cursor(self, filt or {}, projection)

    async def count_documents(self, filt: Optional[dict] = None) -> int:
        docs = await self._find_all(filt or {})
        return len(docs)

    async def insert_one(self, doc: dict) -> InsertOneResult:
        data = deepcopy(doc)
        data.pop('_id', None)
        doc_id = str(
            data.get('id')
            or data.get('sessionHash')
            or data.get('fromSlug')
            or ''
        )
        if not doc_id:
            raise ValueError('Document must include id (or sessionHash / fromSlug)')
        data['id'] = doc_id
        await self.db.pool.execute(
            f'INSERT INTO {self.name} (id, data) VALUES ($1, $2::jsonb)',
            doc_id,
            data,
        )
        return InsertOneResult(doc_id)

    async def replace_one(self, filt: dict, replacement: dict, upsert: bool = False) -> UpdateResult:
        docs = await self._find_all(filt)
        if not docs:
            if upsert:
                data = deepcopy(replacement)
                data.pop('_id', None)
                if 'id' not in data:
                    # redirects: use fromSlug as id
                    data['id'] = data.get('fromSlug') or data.get('id')
                await self.insert_one(data)
                return UpdateResult(1, 1)
            return UpdateResult(0, 0)
        doc_id = docs[0]['id']
        data = deepcopy(replacement)
        data.pop('_id', None)
        data['id'] = doc_id
        await self.db.pool.execute(
            f'UPDATE {self.name} SET data = $2::jsonb WHERE id = $1',
            doc_id,
            data,
        )
        return UpdateResult(1, 1)

    async def update_one(
        self,
        filt: dict,
        update: dict,
        upsert: bool = False,
    ) -> UpdateResult:
        docs = await self._find_all(filt)
        if not docs:
            if upsert:
                base: dict[str, Any] = {}
                if '$set' in update:
                    base.update(update['$set'])
                # Ensure id for redirects
                if 'id' not in base and 'fromSlug' in base:
                    base['id'] = base['fromSlug']
                if 'id' not in base:
                    # merge filter equality fields
                    for k, v in filt.items():
                        if not k.startswith('$') and not isinstance(v, dict):
                            base[k] = v
                    if 'fromSlug' in base and 'id' not in base:
                        base['id'] = base['fromSlug']
                await self.insert_one(base)
                return UpdateResult(1, 1)
            return UpdateResult(0, 0)
        new_doc = _apply_update(docs[0], update)
        new_doc['id'] = docs[0]['id']
        await self.db.pool.execute(
            f'UPDATE {self.name} SET data = $2::jsonb WHERE id = $1',
            docs[0]['id'],
            new_doc,
        )
        return UpdateResult(1, 1)

    async def update_many(self, filt: dict, update: dict) -> UpdateResult:
        docs = await self._find_all(filt)
        n = 0
        for doc in docs:
            new_doc = _apply_update(doc, update)
            new_doc['id'] = doc['id']
            await self.db.pool.execute(
                f'UPDATE {self.name} SET data = $2::jsonb WHERE id = $1',
                doc['id'],
                new_doc,
            )
            n += 1
        return UpdateResult(n, n)

    async def delete_one(self, filt: dict) -> UpdateResult:
        docs = await self._find_all(filt)
        if not docs:
            return UpdateResult(0, 0)
        await self.db.pool.execute(f'DELETE FROM {self.name} WHERE id = $1', docs[0]['id'])
        return UpdateResult(1, 1)

    async def delete_many(self, filt: dict) -> UpdateResult:
        docs = await self._find_all(filt)
        if not docs:
            return UpdateResult(0, 0)
        ids = [d['id'] for d in docs]
        await self.db.pool.execute(f'DELETE FROM {self.name} WHERE id = ANY($1::text[])', ids)
        return UpdateResult(len(ids), len(ids))

    async def create_index(self, *args: Any, **kwargs: Any) -> None:
        """Indexes live in schema.sql — no-op for API compatibility."""
        return None

    async def aggregate(self, pipeline: Sequence[dict]) -> list[dict]:
        """Minimal aggregate: duplicate slug group used by dashboard."""
        # [{'$group': {'_id': '$slug', 'count': {'$sum': 1}}}, {'$match': {'count': {'$gt': 1}}}]
        docs = await self._find_all({})
        if not pipeline:
            return docs
        group = pipeline[0].get('$group') if pipeline else None
        if not group:
            return []
        id_expr = group.get('_id')
        field = id_expr[1:] if isinstance(id_expr, str) and id_expr.startswith('$') else None
        if not field:
            return []
        counts: dict[Any, int] = {}
        for d in docs:
            key = _get_path(d, field)
            counts[key] = counts.get(key, 0) + 1
        out = [{'_id': k, 'count': c} for k, c in counts.items()]
        for stage in pipeline[1:]:
            if '$match' in stage:
                m = stage['$match']
                filtered = []
                for row in out:
                    ok = True
                    for mk, mv in m.items():
                        if isinstance(mv, dict) and '$gt' in mv:
                            if not (row.get(mk, 0) > mv['$gt']):
                                ok = False
                        elif row.get(mk) != mv:
                            ok = False
                    if ok:
                        filtered.append(row)
                out = filtered
        return out


class Database:
    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool
        self._collections = {name: Collection(self, name) for name in TABLES}

    def __getattr__(self, name: str) -> Collection:
        if name in self._collections:
            return self._collections[name]
        raise AttributeError(name)

    async def command(self, name: str, *args: Any, **kwargs: Any) -> dict:
        if name == 'ping':
            await self.pool.fetchval('SELECT 1')
            return {'ok': 1.0}
        raise NotImplementedError(f'command {name!r} not supported')

    async def list_collection_names(self) -> list[str]:
        return sorted(TABLES)


async def _init_connection(conn: asyncpg.Connection) -> None:
    await conn.set_type_codec(
        'jsonb',
        encoder=_dumps,
        decoder=json.loads,
        schema='pg_catalog',
    )
    await conn.set_type_codec(
        'json',
        encoder=_dumps,
        decoder=json.loads,
        schema='pg_catalog',
    )


_FORBIDDEN_DDL = re.compile(
    r'^\s*(DROP|ALTER|TRUNCATE|GRANT|REVOKE|CREATE\s+OR\s+REPLACE)\b',
    re.IGNORECASE,
)
_ALLOWED_DDL = re.compile(
    r'^\s*CREATE\s+(TABLE|UNIQUE\s+INDEX|INDEX|EXTENSION)\b',
    re.IGNORECASE,
)


async def ensure_schema(pool: asyncpg.Pool, schema_path: Optional[str] = None) -> None:
    """
    Apply idempotent schema only (CREATE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS).

    Destructive DDL is rejected. Future migrations belong in dated files under
    backend/sql/migrations/ (Alembic or ordered SQL) — never auto-run DROP/ALTER here.
    """
    from pathlib import Path

    path = Path(schema_path) if schema_path else Path(__file__).resolve().parent.parent / 'sql' / 'schema.sql'
    sql = path.read_text(encoding='utf-8')
    lines = []
    for line in sql.splitlines():
        stripped = line.strip()
        if stripped.startswith('--'):
            continue
        lines.append(line)
    cleaned = '\n'.join(lines)
    statements = [s.strip() for s in cleaned.split(';') if s.strip()]
    async with pool.acquire() as conn:
        for stmt in statements:
            if _FORBIDDEN_DDL.search(stmt):
                raise RuntimeError(
                    f'Refused destructive/non-idempotent DDL in schema.sql: {stmt[:80]}… '
                    'Startup may only run CREATE IF NOT EXISTS. Put migrations under backend/sql/migrations/.'
                )
            if not _ALLOWED_DDL.search(stmt):
                raise RuntimeError(
                    f'Refused unexpected statement in schema.sql (must be CREATE … IF NOT EXISTS): {stmt[:80]}…'
                )
            upper = stmt.upper()
            if 'IF NOT EXISTS' not in upper:
                raise RuntimeError(
                    f'Refused non-idempotent CREATE (missing IF NOT EXISTS): {stmt[:80]}…'
                )
            await conn.execute(stmt)
    logger.info('Postgres schema ensured from %s (%s statements)', path, len(statements))
