"""Sentry error tracking setup."""

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

from app.config import get_settings

settings = get_settings()


def setup_sentry() -> bool:
    """Initialize Sentry for error tracking.
    
    Returns True if initialized successfully, False otherwise.
    """
    if not settings.sentry_dsn:
        if settings.is_production:
            raise RuntimeError(
                "Sentry DSN is required in production. "
                "Add SENTRY_DSN to your environment variables."
            )
        print("⚠️  Sentry DSN not configured (development mode)")
        return False
    
    try:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
            ],
            traces_sample_rate=1.0 if settings.debug else 0.1,
            environment=settings.app_env,
            send_default_pii=False,  # Don't send personal data
        )
        print(f"✅ Sentry initialized (environment={settings.app_env})")
        return True
        
    except Exception as e:
        if settings.is_production:
            raise RuntimeError(f"Sentry initialization failed: {e}")
        print(f"⚠️  Sentry initialization failed: {e}")
        return False
