"""Update user phone numbers in the database."""

import asyncio
from sqlalchemy import select, update
from app.database import async_session_factory
from app.models.user import User

async def update_phone():
    async with async_session_factory() as db:
        new_number = "+19786503627"
        
        query = update(User).values(phone_number=new_number)
        await db.execute(query)
        await db.commit()
        print(f"✅ All user phone numbers updated to {new_number}")

if __name__ == "__main__":
    asyncio.run(update_phone())
