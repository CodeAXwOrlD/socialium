"""Twilio service for SMS and WhatsApp messaging."""

import logging
from typing import Any

from twilio.rest import Client
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class TwilioService:
    """Twilio service for sending SMS and WhatsApp messages."""

    def __init__(self):
        self.client = None
        if settings.twilio_account_sid and settings.twilio_auth_token:
            try:
                self.client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
            except Exception as e:
                logger.error(f"Failed to initialize Twilio client: {e}")

    def _format_whatsapp_number(self, phone_number: str) -> str:
        """Format number for Twilio WhatsApp (prefix with 'whatsapp:')."""
        if not phone_number.startswith("whatsapp:"):
            return f"whatsapp:{phone_number}"
        return phone_number

    async def send_sms(self, to: str, body: str) -> Any:
        """Send an SMS message."""
        if not self.client or not settings.twilio_phone_number:
            logger.warning("Twilio SMS not configured, skipping")
            return None

        try:
            message = self.client.messages.create(
                body=body,
                from_=settings.twilio_phone_number,
                to=to
            )
            logger.info(f"SMS sent to {to}: {message.sid}")
            return message
        except Exception as e:
            logger.error(f"Failed to send SMS to {to}: {e}")
            return None

    async def send_whatsapp(self, to: str, body: str) -> Any:
        """Send a WhatsApp message."""
        if not self.client or not settings.twilio_whatsapp_number:
            logger.warning("Twilio WhatsApp not configured, skipping")
            return None

        try:
            # Twilio requires 'whatsapp:' prefix for sandbox and many integrations
            from_number = self._format_whatsapp_number(settings.twilio_whatsapp_number)
            to_number = self._format_whatsapp_number(to)

            logger.info(f"Sending Twilio WhatsApp from {from_number} to {to_number}")

            message = self.client.messages.create(
                body=body,
                from_=from_number,
                to=to_number
            )
            logger.info(f"WhatsApp message sent to {to}: {message.sid}")
            return message
        except Exception as e:
            logger.error(f"Failed to send WhatsApp to {to}: {e}")
            return None

# Singleton instance
twilio_service = TwilioService()
