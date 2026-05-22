"""Platform webhooks — receive comment/DM notifications from social platforms."""

import logging

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.content import Content
from app.services.auto_reply_service import should_auto_reply, generate_reply

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/webhook/linkedin")
async def linkedin_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Receive LinkedIn comment/DM webhooks.
    
    Handles:
    - New comments on published content
    - Auto-reply generation and posting
    """
    try:
        body = await request.json()
        logger.info(f"LinkedIn webhook received: {body}")
        
        # Process new comments
        for event in body.get("events", []):
            if event.get("type") == "comment":
                comment_text = event.get("text", "")
                content_id = event.get("content_id")
                commenter_id = event.get("author_id")
                post_id = event.get("post_id")
                
                # Find the content in our database
                content = await db.execute(
                    select(Content).where(
                        Content.ai_model_used == post_id,
                        Content.platform == "linkedin"
                    )
                )
                content_obj = content.scalar_one_or_none()
                
                if content_obj:
                    # Check if we should auto-reply
                    should_reply = await should_auto_reply(
                        platform="linkedin",
                        comment_text=comment_text,
                    )
                    
                    if should_reply:
                        # Generate reply
                        reply = await generate_reply(
                            comment_text=comment_text,
                            platform="linkedin",
                            tone="professional"
                        )
                        
                        # TODO: Post reply to LinkedIn API
                        # POST https://api.linkedin.com/v2/comments
                        logger.info(f"Auto-reply to LinkedIn comment: {reply}")
                        
        return {"status": "received"}
        
    except Exception as e:
        logger.error(f"Error processing LinkedIn webhook: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


@router.post("/webhook/twitter")
async def twitter_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Receive Twitter mention/reply webhooks.
    
    Handles:
    - New replies to published tweets
    - Auto-reply generation and posting
    - Mention handling
    """
    try:
        body = await request.json()
        logger.info(f"Twitter webhook received: {body}")
        
        # Twitter Account Activity API sends different event types
        for event in body.get("tweet_create_events", []) + body.get("direct_message_events", []):
            # Handle tweet replies
            if "in_reply_to_status_id" in event:
                tweet_text = event.get("text", "")
                tweet_id = event.get("id")
                author_id = event.get("user_id")
                in_reply_to = event.get("in_reply_to_status_id")
                
                # Find the original content
                content = await db.execute(
                    select(Content).where(
                        Content.ai_model_used == in_reply_to,
                        Content.platform == "twitter"
                    )
                )
                content_obj = content.scalar_one_or_none()
                
                if content_obj:
                    # Check if we should auto-reply
                    should_reply = await should_auto_reply(
                        platform="twitter",
                        comment_text=tweet_text,
                    )
                    
                    if should_reply:
                        # Generate reply
                        reply = await generate_reply(
                            comment_text=tweet_text,
                            platform="twitter",
                            tone="casual"
                        )
                        
                        # TODO: Post reply to Twitter API
                        # POST https://api.twitter.com/2/tweets
                        logger.info(f"Auto-reply to Twitter: {reply}")
            
            # Handle DMs
            if "message_create" in event:
                dm_text = event.get("message_create", {}).get("message_data", {}).get("text", "")
                sender_id = event.get("message_create", {}).get("sender_id")
                
                if dm_text:
                    # Generate DM reply
                    reply = await generate_reply(
                        comment_text=dm_text,
                        platform="twitter",
                        tone="professional"
                    )
                    
                    # TODO: Send DM reply via Twitter API
                    logger.info(f"Auto-reply to Twitter DM: {reply}")
                        
        return {"status": "received"}
        
    except Exception as e:
        logger.error(f"Error processing Twitter webhook: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


@router.post("/webhook/instagram")
async def instagram_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Receive Instagram comment/DM webhooks via Facebook Graph API.
    
    Handles:
    - New comments on published posts
    - Story mentions
    - Direct messages
    """
    try:
        body = await request.json()
        logger.info(f"Instagram webhook received: {body}")
        
        # Instagram webhooks come via Facebook's Realtime Updates
        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                if change.get("field") == "comments":
                    comment_data = change.get("value", {})
                    comment_text = comment_data.get("message", "")
                    post_id = comment_data.get("media_id")
                    commenter_id = comment_data.get("from", {}).get("id")
                    
                    # Find the content
                    content = await db.execute(
                        select(Content).where(
                            Content.ai_model_used == post_id,
                            Content.platform == "instagram"
                        )
                    )
                    content_obj = content.scalar_one_or_none()
                    
                    if content_obj:
                        # Check if we should auto-reply
                        should_reply = await should_auto_reply(
                            platform="instagram",
                            comment_text=comment_text,
                        )
                        
                        if should_reply:
                            # Generate reply
                            reply = await generate_reply(
                                comment_text=comment_text,
                                platform="instagram",
                                tone="friendly"
                            )
                            
                            # TODO: Post reply to Instagram Graph API
                            # POST https://graph.facebook.com/v18.0/{comment-id}/replies
                            logger.info(f"Auto-reply to Instagram comment: {reply}")
                
                elif change.get("field") == "messages":
                    # Handle Instagram DMs
                    message_data = change.get("value", {})
                    message_text = message_data.get("body", "")
                    
                    if message_text:
                        # Generate DM reply
                        reply = await generate_reply(
                            comment_text=message_text,
                            platform="instagram",
                            tone="professional"
                        )
                        
                        # TODO: Send reply via Instagram Graph API
                        logger.info(f"Auto-reply to Instagram DM: {reply}")
                        
        return {"status": "received"}
        
    except Exception as e:
        logger.error(f"Error processing Instagram webhook: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


@router.get("/webhook/{platform}/verify")
async def verify_webhook(platform: str, request: Request):
    """Verify webhook subscriptions for platforms.
    
    Some platforms (Twitter, Facebook) require webhook verification
    before they start sending events.
    """
    from app.config import get_settings
    settings = get_settings()
    
    params = dict(request.query_params)
    
    # Twitter webhook verification
    if platform == "twitter" and "crc_token" in params:
        crc_token = params["crc_token"]
        # TODO: Implement CRC validation with consumer secret
        import hmac
        import hashlib
        import base64
        
        # This is simplified - implement proper validation
        response_token = f"sha256={base64.b64encode(hmac.new(b'secret', crc_token.encode(), hashlib.sha256).digest()).decode()}"
        
        return {"response_token": response_token}
    
    # Facebook/Instagram webhook verification
    if platform in ["facebook", "instagram"] and "hub.challenge" in params:
        if params.get("hub.verify_token") == settings.webhook_verify_token:
            return {"challenge": params["hub.challenge"]}
    
    return {"status": "verification_failed"}
