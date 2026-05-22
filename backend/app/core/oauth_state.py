"""OAuth state management using Redis for secure CSRF protection."""

import asyncio
import json
import secrets
import time

import redis.asyncio as aioredis

from app.config import get_settings

settings = get_settings()

OAUTH_STATE_TTL = 600  # 10 minutes


# In-memory fallback for development when Redis is missing
_memory_store: dict[str, str] = {}

async def _get_redis() -> aioredis.Redis | None:
    """Get an async Redis connection. Returns None if connection fails."""
    try:
        r = aioredis.from_url(settings.redis_url, decode_responses=True)
        # Test connection
        await asyncio.wait_for(r.ping(), timeout=1.0)
        return r
    except Exception:
        return None


async def generate_oauth_state(platform: str, user_id: str, redirect_path: str = "/platforms") -> str:
    """Generate a cryptographically random OAuth state and store it in Redis (or memory)."""
    state = secrets.token_urlsafe(32)
    payload = {
        "platform": platform,
        "user_id": user_id,
        "redirect_path": redirect_path,
        "created_at": time.time(),
    }
    
    r = await _get_redis()
    if r:
        await r.setex(f"oauth_state:{state}", OAUTH_STATE_TTL, json.dumps(payload))
    else:
        # Fallback to memory
        _memory_store[f"oauth_state:{state}"] = json.dumps(payload)
    
    return state


async def validate_oauth_state(state: str) -> dict | None:
    """Validate an OAuth state, returning the stored payload if valid."""
    key = f"oauth_state:{state}"
    r = await _get_redis()
    
    if r:
        data = await r.get(key)
        if data:
            await r.delete(key)
    else:
        # Fallback to memory
        data = _memory_store.pop(key, None)
        
    if data is None:
        return None
        
    try:
        return json.loads(data)
    except json.JSONDecodeError:
        return None
