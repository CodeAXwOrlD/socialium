"""Request ID middleware - adds unique ID to every request for tracing."""

import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logging_setup import get_logger
from structlog.contextvars import bind_contextvars, clear_contextvars

logger = get_logger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Add unique request ID to every request and include in logs.
    
    This enables tracing a request through the entire system.
    The request ID is:
    1. Generated if not provided
    2. Stored in structlog context (included in all logs)
    3. Added to response headers
    """
    
    async def dispatch(self, request: Request, call_next):
        # Clear context from previous request
        clear_contextvars()
        
        # Extract or generate request ID
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        
        # Bind to structlog context (automatically included in all logs)
        bind_contextvars(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
        )
        
        # Log request start
        logger.info(f"{request.method} {request.url.path} started")
        
        # Process request
        response = await call_next(request)
        
        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id
        
        # Log request completion
        logger.info(
            f"{request.method} {request.url.path} completed",
            status_code=response.status_code,
        )
        
        return response
