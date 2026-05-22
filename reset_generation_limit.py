#!/usr/bin/env python3
"""
Reset AI generation counter for testing.
This clears the Redis counter so you can generate more content today.
"""

import redis
from datetime import date

# Configuration
REDIS_URL = "redis://localhost:6379/0"
WORKSPACE_ID = "00000000-0000-0000-0000-000000000000"  # Default demo workspace

def reset_counter(workspace_id: str = WORKSPACE_ID):
    """Reset the daily generation counter for a workspace."""
    try:
        r = redis.from_url(REDIS_URL, decode_responses=True)
        
        # Build the key
        today = date.today().isoformat()
        key = f"ratelimit:gen:{workspace_id}:{today}"
        
        # Check current value
        current = r.get(key)
        print(f"Current count for workspace {workspace_id}: {current or 0}")
        
        # Delete the key
        r.delete(key)
        print(f"✅ Counter reset successfully!")
        print(f"   Key deleted: {key}")
        print(f"   You can now generate content again.")
        
        r.close()
        return True
        
    except redis.ConnectionError:
        print("❌ Could not connect to Redis!")
        print("   Make sure Redis is running: redis-server")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def show_usage(workspace_id: str = WORKSPACE_ID):
    """Show current usage without resetting."""
    try:
        r = redis.from_url(REDIS_URL, decode_responses=True)
        
        today = date.today().isoformat()
        key = f"ratelimit:gen:{workspace_id}:{today}"
        
        current = r.get(key)
        count = int(current) if current else 0
        
        print(f"📊 Usage for workspace {workspace_id}")
        print(f"   Date: {today}")
        print(f"   Generations used: {count}/5 (FREE tier)")
        print(f"   Remaining: {max(0, 5 - count)}")
        
        r.close()
        
    except redis.ConnectionError:
        print("❌ Could not connect to Redis!")
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--show":
        workspace = sys.argv[2] if len(sys.argv) > 2 else WORKSPACE_ID
        show_usage(workspace)
    elif len(sys.argv) > 1 and sys.argv[1] == "--workspace":
        workspace = sys.argv[2] if len(sys.argv) > 2 else WORKSPACE_ID
        reset_counter(workspace)
    else:
        print("🔄 Socialium - Reset AI Generation Counter")
        print("=" * 50)
        print()
        reset_counter()
        print()
        print("Options:")
        print("  --show              Show current usage")
        print("  --workspace <id>    Reset for specific workspace")
