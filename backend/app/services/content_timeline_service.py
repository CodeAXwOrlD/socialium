"""Content status timeline component — visualizes content workflow progress."""

from datetime import datetime
from typing import Optional


def format_datetime(dt: Optional[datetime]) -> str:
    """Format datetime for display."""
    if dt is None:
        return "Not yet"
    return dt.strftime("%b %d, %Y %I:%M %p")


class ContentTimeline:
    """Represents the content lifecycle timeline."""
    
    STEPS = [
        {"name": "Draft", "status": "draft", "icon": "edit", "description": "Content created as draft"},
        {"name": "Pending Approval", "status": "pending_approval", "icon": "pending", "description": "Awaiting approval via WhatsApp"},
        {"name": "Approved", "status": "approved", "icon": "check_circle", "description": "Content approved by user"},
        {"name": "Scheduled", "status": "scheduled", "icon": "schedule", "description": "Scheduled for optimal posting time"},
        {"name": "Published", "status": "published", "icon": "public", "description": "Published to social media platform"},
        {"name": "Analytics Collected", "status": "analytics", "icon": "analytics", "description": "Engagement metrics collected (24h after publish)"},
    ]
    
    STATUS_ORDER = ["draft", "pending_approval", "approved", "scheduled", "published", "analytics"]
    
    def __init__(
        self,
        current_status: str,
        scheduled_at: Optional[datetime] = None,
        published_at: Optional[datetime] = None,
        engagement_collected_at: Optional[datetime] = None,
    ):
        self.current_status = current_status
        self.scheduled_at = scheduled_at
        self.published_at = published_at
        self.engagement_collected_at = engagement_collected_at
    
    def get_current_step_index(self) -> int:
        """Get the index of the current step in the workflow."""
        if self.current_status in self.STATUS_ORDER:
            return self.STATUS_ORDER.index(self.current_status)
        return 0
    
    def get_timeline_data(self) -> list[dict]:
        """Get timeline data with completed/incomplete steps."""
        current_index = self.get_current_step_index()
        
        # If published and engagement not collected yet, show analytics as current
        if self.current_status == "published" and self.engagement_collected_at is None:
            current_index = min(current_index + 1, len(self.STEPS) - 1)
        
        timeline = []
        for idx, step in enumerate(self.STEPS):
            is_completed = idx < current_index
            is_current = idx == current_index
            
            # Get timestamp for completed steps
            timestamp = None
            if step["status"] == "scheduled" and self.scheduled_at:
                timestamp = self.scheduled_at
            elif step["status"] == "published" and self.published_at:
                timestamp = self.published_at
            elif step["status"] == "analytics" and self.engagement_collected_at:
                timestamp = self.engagement_collected_at
            
            timeline.append({
                "name": step["name"],
                "status": step["status"],
                "icon": step["icon"],
                "description": step["description"],
                "is_completed": is_completed,
                "is_current": is_current,
                "timestamp": timestamp,
                "formatted_time": format_datetime(timestamp),
            })
        
        return timeline


# Example usage in FastAPI endpoint
async def get_content_timeline(content) -> dict:
    """Get timeline data for a content object."""
    timeline = ContentTimeline(
        current_status=content.status.value if hasattr(content.status, 'value') else content.status,
        scheduled_at=content.scheduled_at,
        published_at=content.published_at,
        engagement_collected_at=getattr(content, 'engagement_collected_at', None),
    )
    
    return {
        "timeline": timeline.get_timeline_data(),
        "current_status": content.status.value if hasattr(content.status, 'value') else content.status,
        "scheduled_at": content.scheduled_at,
        "published_at": content.published_at,
    }
