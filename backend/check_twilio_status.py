"""Check Twilio message status."""
import sys
import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

sid = os.getenv("TWILIO_ACCOUNT_SID")
token = os.getenv("TWILIO_AUTH_TOKEN")
client = Client(sid, token)

message_sid = sys.argv[1]
message = client.messages(message_sid).fetch()

print(f"SID: {message.sid}")
print(f"Status: {message.status}")
print(f"Error Code: {message.error_code}")
print(f"Error Message: {message.error_message}")
print(f"To: {message.to}")
print(f"From: {message.from_}")
