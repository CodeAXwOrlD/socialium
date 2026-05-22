"""Twilio webhook router — Inbound messages for approval cycle and conversation."""

import logging
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.models.content import Content
from app.models.user import User
from app.core.constants import ContentStatus
from app.services.whatsapp_notification_service import (
    send_approval_result_notification,
)
from app.services.twilio_service import twilio_service
from app.services.ai_chat_service import ai_chat_service
from twilio.request_validator import RequestValidator

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()

def verify_twilio_signature(request: Request, body: bytes, signature: str | None) -> bool:
    """Verify that the request came from Twilio."""
    if not settings.twilio_auth_token or not signature:
        return False
    validator = RequestValidator(settings.twilio_auth_token)
    # Twilio signature validation requires the full URL
    url = str(request.url)
    # Form data needs to be passed as a dict
    from urllib.parse import parse_qs
    params = {k: v[0] for k, v in parse_qs(body.decode()).items()}
    return validator.validate(url, params, signature)

# Approval keywords mapping
APPROVE_KEYWORDS = {"1", "approve", "yes", "ok", "\u2705", "publish"}
REGENERATE_KEYWORDS = {"2", "regenerate", "redo", "again", "\U0001f504", "retry"}
REJECT_KEYWORDS = {"3", "reject", "no", "discard", "\u274c", "delete"}

def _parse_approval_action(text: str) -> str | None:
    """Parse user reply into an approval action."""
    clean = text.strip().lower()
    if clean in APPROVE_KEYWORDS:
        return "approve"
    if clean in REGENERATE_KEYWORDS:
        return "regenerate"
    if clean in REJECT_KEYWORDS:
        return "reject"
    return None

@router.post("/webhook")
async def twilio_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Receive Twilio webhook events (SMS or WhatsApp).
    
    Handles the approval cycle and general user conversation.
    """
    body = await request.body()
    signature = request.headers.get("X-Twilio-Signature")
    
    # Optional: Enable signature validation in production
    if settings.app_env == "production" and not verify_twilio_signature(request, body, signature):
        logger.warning("Invalid Twilio signature received")
        raise HTTPException(status_code=403, detail="Invalid signature")

    # Parse form data from body
    from urllib.parse import parse_qs
    form_data = {k: v[0] for k, v in parse_qs(body.decode()).items()}
    
    from_number = form_data.get("From", "")
    text = form_data.get("Body", "").strip()
    
    if not from_number or not text:
        return Response(content="<Response></Response>", media_type="text/xml")

    logger.info(f"Twilio webhook received from {from_number}: {text}")

    # Normalize phone number (Twilio format is +1234567890 or whatsapp:+1234567890)
    is_whatsapp = from_number.startswith("whatsapp:")
    normalized_phone = from_number.replace("whatsapp:", "").lstrip("+")

    # Try to parse as an approval action
    action = _parse_approval_action(text)

    if action:
        # Find the user by phone number
        user_query = select(User).where(
            (User.phone_number == from_number) |
            (User.phone_number == normalized_phone) |
            (User.phone_number == f"+{normalized_phone}")
        )
        result = await db.execute(user_query)
        user = result.scalars().first()

        if not user:
            reply = "⚠️ Sorry, we couldn't find an account linked to this number. Please register your number in Socialium settings."
            if is_whatsapp:
                await twilio_service.send_whatsapp(from_number, reply)
            else:
                await twilio_service.send_sms(from_number, reply)
            return Response(content="<Response></Response>", media_type="text/xml")

        # Find the most recent pending_approval content for this user
        content_query = (
            select(Content)
            .where(
                Content.author_id == user.id,
                Content.status == ContentStatus.PENDING_APPROVAL,
            )
            .order_by(Content.updated_at.desc())
            .limit(1)
        )
        content_result = await db.execute(content_query)
        content = content_result.scalars().first()

        if not content:
            reply = "ℹ️ No content pending approval right now. Generate content first from the Socialium dashboard."
            if is_whatsapp:
                await twilio_service.send_whatsapp(from_number, reply)
            else:
                await twilio_service.send_sms(from_number, reply)
            return Response(content="<Response></Response>", media_type="text/xml")

        # Process the approval action
        if action == "approve":
            content.status = ContentStatus.APPROVED
            logger.info(f"Content {content.id} approved via Twilio by {user.email}")
        elif action == "regenerate":
            content.status = ContentStatus.DRAFT
            logger.info(f"Content {content.id} sent for regeneration via Twilio by {user.email}")
        elif action == "reject":
            content.status = ContentStatus.REJECTED
            logger.info(f"Content {content.id} rejected via Twilio by {user.email}")

        await db.commit()

        # Send confirmation (reuse the logic but send via Twilio if configured)
        # For now, we'll manually construct the reply or call a service
        # Since send_approval_result_notification currently only uses WapiHub, we should update it.
        # But here I'll just send a direct reply.
        
        emoji = "✅" if action == "approve" else "🔄" if action == "regenerate" else "❌"
        status_text = "approved" if action == "approve" else "sent for regeneration" if action == "regenerate" else "rejected"
        platform_name = content.platform.value if content.platform else "general"
        
        reply = f"{emoji} Content {status_text}!\nYour {platform_name.capitalize()} post has been processed."
        if action == "approve":
            reply += "\nIt will be published at the next scheduled slot."
        
        if is_whatsapp:
            await twilio_service.send_whatsapp(from_number, reply)
        else:
            await twilio_service.send_sms(from_number, reply)
    else:
        # User-to-system convo: Handle general messages with AI
        user_id = str(user.id) if 'user' in locals() and user else "unknown"
        reply = await ai_chat_service.get_response(user_id=user_id, message=text)
        
        if is_whatsapp:
            await twilio_service.send_whatsapp(from_number, reply)
        else:
            await twilio_service.send_sms(from_number, reply)

    return Response(content="<Response></Response>", media_type="text/xml")
