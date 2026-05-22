"""Script to resend all pending approval notifications via WhatsApp/Twilio."""

import asyncio
import logging
import sys
import os

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from sqlalchemy import select
from app.database import async_session_factory, get_db
from app.models.content import Content
from app.models.user import User
from app.models.workspace import Workspace
from app.models.approval import Approval
from app.models.workspace_member import WorkspaceMember
from app.models.platform_account import PlatformAccount
from app.models.viral_score import ViralScore
from app.models.audience_activity import AudienceActivitySnapshot
from app.models.ab_test import ABTest
from app.models.analytics import AnalyticsEvent
from app.models.notification import Notification
from app.models.trend import Trend
from app.core.constants import ContentStatus
from app.services.whatsapp_notification_service import send_approval_notification

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def resend_all_pending():
    async with async_session_factory() as db:
        # Find all content with pending_approval status
        query = (
            select(Content)
            .where(Content.status == ContentStatus.PENDING_APPROVAL)
            .order_by(Content.created_at.desc())
        )
        result = await db.execute(query)
        pending_contents = result.scalars().all()
        
        if not pending_contents:
            print("No pending approval content found.")
            return

        print(f"Found {len(pending_contents)} items pending approval. Resending notifications...")
        
        for content in pending_contents:
            # Get the author's phone number
            author = await db.get(User, content.author_id)
            if not author or not author.phone_number:
                print(f"Skipping Content {content.id}: No author phone number found.")
                continue
            
            phone_number = author.phone_number
            if not phone_number.startswith('+'):
                phone_number = f"+{phone_number}"
            
            print(f"Resending notification for Content {content.id} to {phone_number}...")
            
            try:
                sent = await send_approval_notification(
                    phone_number=phone_number,
                    content_id=str(content.id),
                    platform=content.platform.value if content.platform else "general",
                    content_preview=content.body or "No content",
                    title=content.title,
                )
                if sent:
                    print(f"✅ Notification resent for Content {content.id}")
                else:
                    print(f"❌ Failed to resend notification for Content {content.id}")
            except Exception as e:
                print(f"❌ Error resending notification for Content {content.id}: {e}")

if __name__ == "__main__":
    asyncio.run(resend_all_pending())
