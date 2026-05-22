#!/usr/bin/env python3
"""Test WhatsApp message sending via WapiHub"""

import asyncio
import httpx
from app.config import get_settings

async def test():
    settings = get_settings()
    
    print("=" * 60)
    print("WAPIHUB CONFIGURATION TEST")
    print("=" * 60)
    print(f"URL: {settings.wapihub_url}")
    print(f"API Key: {settings.wapihub_api_key[:20]}...")
    print(f"Phone Number ID: {settings.wapihub_phone_number_id}")
    print(f"Target Phone: +918595165654")
    print("=" * 60)
    print()
    
    # Test WapiHub
    url = f"{settings.wapihub_url}/messages"
    headers = {
        "Authorization": f"Bearer {settings.wapihub_api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "phone": "+918595165654",
        "message": "🔍 Test from Socialium - If you receive this, WhatsApp is working!",
        "phone_number_id": settings.wapihub_phone_number_id
    }
    
    print("Sending test message via WapiHub...")
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            print(f"\nStatus Code: {response.status_code}")
            print(f"Response Body:\n{response.text}")
            
            if response.status_code in (200, 201):
                print("\n✅ SUCCESS: Message accepted by WapiHub")
            else:
                print(f"\n❌ FAILED: WapiHub returned {response.status_code}")
        except Exception as e:
            print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test())
