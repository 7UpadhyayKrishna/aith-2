"""Railway/Railpack entry shim — prefer `uvicorn server:app` in production."""
from server import app

__all__ = ["app"]
