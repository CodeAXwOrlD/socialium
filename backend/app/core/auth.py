"""Authentication dependency for protected routes."""

import logging
import uuid as uuid_mod
from datetime import datetime, timezone

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.models.user import User

logger = logging.getLogger(__name__)

security = HTTPBearer()
settings = get_settings()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate JWT token via Supabase, return current user.
    
    This dependency should be added to all protected routes.
    Usage:
        @router.get("/protected")
        async def protected_route(current_user: User = Depends(get_current_user)):
            ...
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Validate token by calling Supabase /auth/v1/user endpoint
        # This is the most reliable way since Supabase uses ES256 asymmetric keys
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.supabase_url}/auth/v1/user",
                headers={
                    "apikey": settings.supabase_anon_key,
                    "Authorization": f"Bearer {credentials.credentials}",
                },
            )
            
            if response.status_code != 200:
                logger.error(f"Supabase token validation failed: {response.status_code} {response.text}")
                raise credentials_exception
            
            supabase_user = response.json()
            user_id = supabase_user.get("sub") or supabase_user.get("id")
            email = supabase_user.get("email")
            
            if not user_id:
                logger.error("No user ID in Supabase response")
                raise credentials_exception
            
    except httpx.RequestError as e:
        logger.error(f"Failed to connect to Supabase: {e}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Authentication failed: {e}", exc_info=True)
        raise credentials_exception
    
    # Fetch user from database
    try:
        user_id_uuid = uuid_mod.UUID(user_id)
        result = await db.execute(select(User).where(User.id == user_id_uuid))
        user = result.scalar_one_or_none()
        
        if user is None:
            raise credentials_exception
        
        logger.info(f"Authenticated user: {user.email} (id={user_id})")
        return user
        
    except ValueError:
        logger.error(f"Invalid user ID format in token: {user_id}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Database lookup failed: {e}", exc_info=True)
        raise credentials_exception


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Optional authentication - returns None if token invalid (for public routes with optional auth)."""
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None
