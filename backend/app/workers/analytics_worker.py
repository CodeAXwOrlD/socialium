"""Analytics collection worker — fetches engagement metrics after 24h."""

import logging
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory
from app.models.content import Content
from app.models.platform_account import PlatformAccount
from app.core.constants import ContentStatus

logger = logging.getLogger(__name__)


async def collect_engagement_analytics() -> None:
    """Collect engagement metrics for content published 24+ hours ago."""
    try:
        async with async_session_factory() as db:
            # Find content published 24-48 hours ago that hasn't been analyzed yet
            now = datetime.now(timezone.utc)
            cutoff_24h = now - timedelta(hours=24)
            cutoff_48h = now - timedelta(hours=48)
            
            result = await db.execute(
                select(Content).where(
                    Content.status == ContentStatus.PUBLISHED,
                    Content.published_at >= cutoff_48h,
                    Content.published_at <= cutoff_24h,
                )
            )
            contents = result.scalars().all()
            
            logger.info(f"Found {len(contents)} posts to collect analytics for")
            
            for content in contents:
                try:
                    # Fetch engagement from platform API
                    metrics = await fetch_platform_engagement(content, db)
                    
                    if metrics:
                        # Update content with metrics
                        content.engagement_count = metrics.get('total', 0)
                        content.like_count = metrics.get('likes', 0)
                        content.comment_count = metrics.get('comments', 0)
                        content.share_count = metrics.get('shares', 0)
                        
                        await db.commit()
                        logger.info(f"Collected analytics for content {content.id}: {metrics.get('total', 0)} engagements")
                    else:
                        logger.warning(f"No analytics data for content {content.id}")
                        
                except Exception as e:
                    await db.rollback()
                    logger.error(f"Failed to collect analytics for {content.id}: {e}", exc_info=True)
                    
    except Exception as e:
        logger.error(f"Analytics worker failed: {e}", exc_info=True)


async def fetch_platform_engagement(content: Content, db: AsyncSession) -> dict | None:
    """Fetch engagement metrics from platform API."""
    platform = content.platform.value if content.platform else None
    platform_post_id = content.ai_model_used  # Stores the platform post ID
    
    if not platform_post_id:
        logger.warning(f"No platform post ID for content {content.id}")
        return None
    
    if platform == "linkedin":
        return await fetch_linkedin_engagement(platform_post_id, db, content.workspace_id)
    elif platform == "twitter":
        return await fetch_twitter_engagement(platform_post_id, db, content.workspace_id)
    elif platform == "instagram":
        return await fetch_instagram_engagement(platform_post_id, db, content.workspace_id)
    
    logger.warning(f"Unsupported platform for analytics: {platform}")
    return None


async def fetch_linkedin_engagement(share_id: str, db: AsyncSession, workspace_id) -> dict | None:
    """Fetch LinkedIn engagement metrics."""
    try:
        # Get OAuth token
        result = await db.execute(
            select(PlatformAccount).where(
                PlatformAccount.workspace_id == workspace_id,
                PlatformAccount.platform == "linkedin",
                PlatformAccount.is_active == True
            )
        )
        account = result.scalars().first()
        
        if not account:
            return None
        
        # LinkedIn API: Get share statistics
        url = f"https://api.linkedin.com/v2/shares/{share_id}"
        headers = {
            "Authorization": f"Bearer {account.access_token}",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract engagement metrics
                # Note: LinkedIn returns data in a specific format
                total_engagement = 0
                likes = 0
                comments = 0
                shares = 0
                
                # Parse the response (adjust based on actual LinkedIn API response)
                if "specificContent" in data:
                    share_content = data["specificContent"]
                    if "com.linkedin.ugc.ShareContent" in share_content:
                        ugc_content = share_content["com.linkedin.ugc.ShareContent"]
                        # Engagement might be in a separate statistics endpoint
                        pass
                
                # For now, return placeholder - LinkedIn requires additional API calls for stats
                return {
                    "total": total_engagement,
                    "likes": likes,
                    "comments": comments,
                    "shares": shares
                }
            else:
                logger.error(f"LinkedIn analytics API error: {response.status_code}")
                return None
                
    except Exception as e:
        logger.error(f"Failed to fetch LinkedIn analytics: {e}")
        return None


async def fetch_twitter_engagement(tweet_id: str, db: AsyncSession, workspace_id) -> dict | None:
    """Fetch Twitter engagement metrics."""
    try:
        # Get OAuth token
        result = await db.execute(
            select(PlatformAccount).where(
                PlatformAccount.workspace_id == workspace_id,
                PlatformAccount.platform == "twitter",
                PlatformAccount.is_active == True
            )
        )
        account = result.scalars().first()
        
        if not account:
            return None
        
        # Twitter API v2: Get tweet with public metrics
        url = f"https://api.twitter.com/2/tweets/{tweet_id}"
        params = {
            "tweet.fields": "public_metrics"
        }
        headers = {
            "Authorization": f"Bearer {account.access_token}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                metrics = data.get("data", {}).get("public_metrics", {})
                
                return {
                    "total": metrics.get("like_count", 0) + metrics.get("retweet_count", 0) + metrics.get("reply_count", 0),
                    "likes": metrics.get("like_count", 0),
                    "comments": metrics.get("reply_count", 0),
                    "shares": metrics.get("retweet_count", 0)
                }
            else:
                logger.error(f"Twitter analytics API error: {response.status_code}")
                return None
                
    except Exception as e:
        logger.error(f"Failed to fetch Twitter analytics: {e}")
        return None


async def fetch_instagram_engagement(post_id: str, db: AsyncSession, workspace_id) -> dict | None:
    """Fetch Instagram engagement metrics."""
    try:
        # Get OAuth token
        result = await db.execute(
            select(PlatformAccount).where(
                PlatformAccount.workspace_id == workspace_id,
                PlatformAccount.platform == "instagram",
                PlatformAccount.is_active == True
            )
        )
        account = result.scalars().first()
        
        if not account:
            return None
        
        # Instagram Graph API: Get media insights
        url = f"https://graph.facebook.com/v18.0/{post_id}"
        params = {
            "fields": "like_count,comments_count,engagement",
            "access_token": account.access_token
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                likes = data.get("like_count", 0)
                comments = data.get("comments_count", 0)
                engagement = data.get("engagement", 0)
                
                return {
                    "total": engagement or (likes + comments),
                    "likes": likes,
                    "comments": comments,
                    "shares": 0  # Instagram doesn't expose shares easily
                }
            else:
                logger.error(f"Instagram analytics API error: {response.status_code}")
                return None
                
    except Exception as e:
        logger.error(f"Failed to fetch Instagram analytics: {e}")
        return None
