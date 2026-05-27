"""Celery/APScheduler configuration for periodic tasks."""

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.redis import RedisJobStore
from apscheduler.executors.asyncio import AsyncIOExecutor

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_scheduler: AsyncIOScheduler | None = None


def start_scheduler() -> None:
    """Start the APScheduler with Redis job store."""
    global _scheduler

    if _scheduler is not None:
        return

    jobstores = {}
    if settings.redis_url:
        try:
            from redis import Redis
            jobstores["default"] = RedisJobStore(
                host=settings.redis_url.split("://")[1].split(":")[0],
                port=int(settings.redis_url.split(":")[2].split("/")[0]),
                db=int(settings.redis_url.split("/")[-1]) if "/" in settings.redis_url.split("://")[1] else 0
            )
            logger.info("Using Redis job store for scheduler")
        except Exception as e:
            logger.warning(f"Redis job store setup failed, using memory: {e}")

    executors = {
        "default": AsyncIOExecutor(),
        "publish": AsyncIOExecutor(),
    }

    job_defaults = {
        "coalesce": True,
        "max_instances": 1,
        "misfire_grace_time": 60,
    }

    _scheduler = AsyncIOScheduler(
        jobstores=jobstores,
        executors=executors,
        job_defaults=job_defaults,
        timezone="UTC",
    )

    # Schedule periodic tasks
    _scheduler.add_job(
        _publish_wrapper,
        "interval",
        minutes=1,
        id="publish_scheduled",
        executor="publish",
        replace_existing=True,  # Replace job if it already exists (prevents conflicts on restart)
        max_instances=1,
    )

    _scheduler.add_job(
        _trends_wrapper,
        "interval",
        hours=6,
        id="refresh_trends",
        executor="default",
        replace_existing=True,
        max_instances=1,
    )

    _scheduler.add_job(
        _churn_wrapper,
        "interval",
        hours=24,
        id="detect_churn_and_reengage",
        executor="default",
        replace_existing=True,
        max_instances=1,
    )

    _scheduler.add_job(
        _analytics_wrapper,
        "interval",
        hours=6,
        id="collect_engagement_analytics",
        executor="default",
        replace_existing=True,
        max_instances=1,
    )

    _scheduler.start()
    logger.info("APScheduler started with periodic tasks")


def stop_scheduler() -> None:
    """Stop the scheduler gracefully."""
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        logger.info("APScheduler stopped")


async def _publish_wrapper() -> None:
    """Wrapper for publish worker."""
    from app.workers.publish_worker import publish_scheduled_content
    await publish_scheduled_content()


async def _trends_wrapper() -> None:
    """Wrapper for trend refresh."""
    from app.workers.publish_worker import refresh_trends
    await refresh_trends()


async def _churn_wrapper() -> None:
    """Wrapper for churn detection."""
    from app.workers.publish_worker import churn_detection
    await churn_detection()


async def _analytics_wrapper() -> None:
    """Wrapper for analytics collection."""
    from app.workers.analytics_worker import collect_engagement_analytics
    await collect_engagement_analytics()
