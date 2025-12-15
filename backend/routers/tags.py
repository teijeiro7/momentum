from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from dependencies import get_db
from models import Tag, Habit, User
from schemas import TagCreate, TagResponse, TagWithCount
from utils.auth_utils import get_current_user

router = APIRouter(
    prefix="/tags",
    tags=["tags"]
)


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(
    tag: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new tag for current user"""
    # Check if user already has a tag with this name
    existing = db.query(Tag).filter(
        Tag.name == tag.name,
        Tag.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a tag with this name"
        )
    
    db_tag = Tag(
        name=tag.name,
        user_id=current_user.id
    )
    
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    
    return db_tag


@router.get("", response_model=List[TagResponse])
def list_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all tags for current user"""
    tags = db.query(Tag).filter(Tag.user_id == current_user.id).all()
    return tags


@router.get("/with-counts", response_model=List[TagWithCount])
def list_tags_with_counts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all tags with usage counts"""
    tags = db.query(Tag).filter(Tag.user_id == current_user.id).all()
    
    result = []
    for tag in tags:
        # Count habits using this tag
        habit_count = db.query(Habit).join(Habit.tags).filter(
            Tag.id == tag.id,
            Habit.user_id == current_user.id
        ).count()
        
        result.append(TagWithCount(
            id=tag.id,
            name=tag.name,
            habit_count=habit_count
        ))
    
    return result


@router.get("/{tag_id}", response_model=TagResponse)
def get_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific tag"""
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    return tag


@router.get("/{tag_id}/habits", response_model=List)
def get_tag_habits(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all habits with this tag"""
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Get habits with this tag
    habits = db.query(Habit).join(Habit.tags).filter(
        Tag.id == tag_id,
        Habit.user_id == current_user.id
    ).all()
    
    return habits


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a tag (removes from all habits)"""
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == current_user.id
    ).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    db.delete(tag)
    db.commit()
    
    return None