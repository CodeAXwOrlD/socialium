"""A/B Testing router."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.marketing import ABTestCreate, ABTestResponse
from app.services.ab_testing_service import (
    create_ab_test,
    evaluate_ab_test,
    list_ab_tests,
    get_ab_test_result,
    cancel_ab_test,
)
from app.models.user import User
from app.core.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=list[dict])
async def list_tests(
    workspace_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all A/B tests for a workspace."""
    results = await list_ab_tests(db, str(workspace_id))
    return results


@router.post("/", response_model=dict)
async def create_test(
    body: ABTestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new A/B test."""
    result = await create_ab_test(
        db=db,
        workspace_id=str(body.workspace_id),
        name=body.name,
        variant_a_body=body.variant_a_body,
        variant_b_body=body.variant_b_body,
        platform=body.platform,
        author_id=str(current_user.id),
        description=body.description,
    )
    return result


@router.get("/{test_id}", response_model=dict)
async def get_test(
    test_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get detailed results for an A/B test."""
    result = await get_ab_test_result(db, str(test_id))
    if not result:
        raise HTTPException(status_code=404, detail="AB test not found")
    return result


@router.post("/{test_id}/evaluate")
async def evaluate_test(
    test_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Evaluate an A/B test to determine winner."""
    result = await evaluate_ab_test(db, str(test_id))
    if not result:
        raise HTTPException(status_code=404, detail="AB test not found")
    return result


@router.post("/{test_id}/cancel")
async def cancel_test(
    test_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel/stop an A/B test."""
    success = await cancel_ab_test(db, str(test_id))
    if not success:
        raise HTTPException(status_code=404, detail="AB test not found")
    return {"status": "success"}

