"""AI Chat service for user-to-system conversations via messaging channels."""

import logging
from typing import Any

from app.config import get_settings
from app.core.langfuse_setup import get_openai_client, observe

logger = logging.getLogger(__name__)
settings = get_settings()

class AIChatService:
    """Service to handle conversational AI interactions via SMS/WhatsApp."""

    @observe(name="user-ai-chat")
    async def get_response(self, user_id: str, message: str, context: dict[str, Any] | None = None) -> str:
        """Generate an AI response to a user message."""
        try:
            client = get_openai_client()
            
            system_prompt = (
                "You are Socialium AI, a helpful social media assistant. "
                "You help users manage their content, brainstorm post ideas, and understand their analytics. "
                "Keep your responses concise and suitable for messaging platforms (SMS/WhatsApp). "
                "Use emojis naturally."
            )
            
            # Simple context injection
            if context:
                system_prompt += f"\nContext: {context}"

            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                max_tokens=300,
                temperature=0.7,
                name="twilio-chat-response"
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"AI Chat failed: {e}")
            return "👋 I'm here! I'm having a bit of trouble thinking right now, but I'll be back soon. How can I help with your Socialium account?"

# Singleton instance
ai_chat_service = AIChatService()
