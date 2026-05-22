"""Workspace router."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.models.user import User
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceUpdate,
    WorkspaceResponse,
    WorkspaceMemberAdd,
    WorkspaceMemberResponse,
)
from app.core.auth import get_current_user

router = APIRouter(tags=["Workspace"])


@router.post("/workspaces", response_model=WorkspaceResponse, status_code=201)
async def create_workspace(
    body: WorkspaceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new workspace."""
    workspace = Workspace(
        name=body.name,
        description=body.description,
        brand_voice=body.brand_voice,
        brand_colors=body.brand_colors,
        owner_id=current_user.id,
    )
    db.add(workspace)
    await db.commit()
    await db.refresh(workspace)
    
    # Create workspace member (owner)
    from app.core.constants import WorkspaceRole
    member = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=current_user.id,
        role=WorkspaceRole.OWNER,
    )
    db.add(member)
    await db.commit()
    await db.refresh(workspace)
    
    return workspace


@router.get("/workspaces", response_model=list[WorkspaceResponse])
async def list_workspaces(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all workspaces for the current user."""
    result = await db.execute(
        select(Workspace).where(Workspace.owner_id == current_user.id)
    )
    return result.scalars().all()


@router.get("/workspaces/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(workspace_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get workspace by ID."""
    workspace = await db.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace


@router.patch("/workspaces/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: uuid.UUID, body: WorkspaceUpdate, db: AsyncSession = Depends(get_db)
):
    """Update workspace."""
    workspace = await db.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(workspace, key, value)
    await db.commit()
    await db.refresh(workspace)
    return workspace


@router.delete("/workspaces/{workspace_id}", status_code=204)
async def delete_workspace(workspace_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Delete a workspace."""
    workspace = await db.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    await db.delete(workspace)
    await db.commit()
