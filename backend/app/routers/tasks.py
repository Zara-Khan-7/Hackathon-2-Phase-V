"""
Task CRUD API endpoints.
All endpoints require JWT authentication and enforce task ownership.
Enhanced with tags, reminders, recurring tasks, search, filter, and sort.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, or_
from sqlalchemy import text
from uuid import UUID
from datetime import datetime
from typing import List, Optional

from app.database import get_session
from app.auth.jwt import get_current_user
from app.models.task import Task, TaskStatus, TaskPriority
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, CompleteTaskResponse
from app.services.events import publish_task_event, publish_reminder_event
from app.services.reminder import calculate_remind_at
from app.services.recurring import calculate_next_due_date

# Create router with /api/tasks prefix
router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"],
)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    session: Session = Depends(get_session),
    user_id: str = Depends(get_current_user),
) -> Task:
    """
    Create a new task for the authenticated user.

    US1: Authenticated User Creates a Task
    - Task is created and associated with user_id from JWT
    - Calculates remind_at from due_date and reminder_offset_minutes
    - Publishes task.created event
    - Returns 201 with created task
    - Returns 401 if not authenticated
    - Returns 422 if validation fails
    """
    # Validate reminder requires due_date
    if task_data.reminder_offset_minutes and not task_data.due_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Reminder requires a due date"
        )

    # Calculate remind_at if reminder is set
    remind_at = None
    if task_data.due_date and task_data.reminder_offset_minutes:
        remind_at = calculate_remind_at(task_data.due_date, task_data.reminder_offset_minutes)

    task = Task(
        **task_data.model_dump(),
        user_id=user_id,
        remind_at=remind_at,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    # Publish task.created event
    publish_task_event(
        event_type="task.created",
        user_id=user_id,
        task_data=task.model_dump(mode="json"),
    )

    # Publish reminder.scheduled event if reminder is set
    if remind_at and task.due_date:
        publish_reminder_event(
            user_id=user_id,
            task_id=str(task.id),
            task_title=task.title,
            due_date=task.due_date,
            remind_at=remind_at,
        )

    return task


@router.get("", response_model=List[TaskResponse])
def list_tasks(
    session: Session = Depends(get_session),
    user_id: str = Depends(get_current_user),
    # Search
    search: Optional[str] = Query(None, description="Search in title and description"),
    # Filters
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: all, active, completed"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    has_due_date: Optional[bool] = Query(None, description="Filter by presence of due date"),
    is_recurring: Optional[bool] = Query(None, description="Filter by recurring status"),
    # Sort
    sort: Optional[str] = Query("created_at", description="Sort field: created_at, due_date, priority, title"),
    order: Optional[str] = Query("desc", description="Sort order: asc, desc"),
) -> List[Task]:
    """
    List all tasks for the authenticated user with optional filtering and sorting.

    US2: Authenticated User Lists Their Tasks
    US6: Search tasks by title and description
    US7: Filter by status, priority, tags, due date, recurring
    US8: Sort by created_at, due_date, priority, title

    - Returns only tasks belonging to the authenticated user
    - Returns empty list if user has no tasks or no matches
    - Returns 401 if not authenticated
    """
    # Base query - user's tasks only
    statement = select(Task).where(Task.user_id == user_id)

    # Search filter (ILIKE on title and description)
    if search:
        search_pattern = f"%{search}%"
        statement = statement.where(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern),
            )
        )

    # Status filter
    if status_filter and status_filter != "all":
        if status_filter == "active":
            statement = statement.where(Task.status != TaskStatus.completed)
        elif status_filter == "completed":
            statement = statement.where(Task.status == TaskStatus.completed)
        else:
            # Try to match exact status
            try:
                status_enum = TaskStatus(status_filter)
                statement = statement.where(Task.status == status_enum)
            except ValueError:
                pass  # Invalid status, ignore filter

    # Priority filter
    if priority:
        statement = statement.where(Task.priority == priority)

    # Tags filter (using JSONB containment)
    if tags:
        tag_list = [t.strip().lower() for t in tags.split(",") if t.strip()]
        for tag in tag_list:
            # Check if tags array contains the tag
            statement = statement.where(
                Task.tags.op("@>")(text(f"'[\"{tag}\"]'"))
            )

    # Has due date filter
    if has_due_date is not None:
        if has_due_date:
            statement = statement.where(Task.due_date.isnot(None))
        else:
            statement = statement.where(Task.due_date.is_(None))

    # Is recurring filter
    if is_recurring is not None:
        statement = statement.where(Task.is_recurring == is_recurring)

    # Sorting
    sort_column = Task.created_at  # default
    if sort == "due_date":
        sort_column = Task.due_date
    elif sort == "priority":
        sort_column = Task.priority
    elif sort == "title":
        sort_column = Task.title
    elif sort == "created_at":
        sort_column = Task.created_at

    if order == "asc":
        # For due_date, put nulls last when ascending
        if sort == "due_date":
            statement = statement.order_by(Task.due_date.asc().nullslast())
        else:
            statement = statement.order_by(sort_column.asc())
    else:
        # For due_date, put nulls last when descending too
        if sort == "due_date":
            statement = statement.order_by(Task.due_date.desc().nullslast())
        else:
            statement = statement.order_by(sort_column.desc())

    tasks = session.exec(statement).all()
    return tasks


def get_task_or_404(
    task_id: UUID,
    session: Session,
    user_id: str,
) -> Task:
    """
    Helper function to fetch task by ID and validate ownership.

    US3/US4: Ownership validation for single task operations
    - Returns task if found and owned by user
    - Raises 404 if task not found
    - Raises 403 if task belongs to different user
    """
    statement = select(Task).where(Task.id == task_id)
    task = session.exec(statement).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )

    return task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: UUID,
    session: Session = Depends(get_session),
    user_id: str = Depends(get_current_user),
) -> Task:
    """
    Get a specific task by ID.

    US3: Authenticated User Retrieves a Single Task
    - Returns task details if owned by user
    - Returns 401 if not authenticated
    - Returns 403 if task belongs to different user
    - Returns 404 if task not found
    """
    return get_task_or_404(task_id, session, user_id)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    session: Session = Depends(get_session),
    user_id: str = Depends(get_current_user),
) -> Task:
    """
    Update an existing task.

    US4: Authenticated User Updates Their Task
    - Updates task fields (partial update supported)
    - Recalculates remind_at if due_date or reminder_offset changes
    - Publishes task.updated event
    - Refreshes updated_at timestamp
    - Returns 401 if not authenticated
    - Returns 403 if task belongs to different user
    - Returns 404 if task not found
    - Returns 422 if validation fails
    """
    task = get_task_or_404(task_id, session, user_id)

    # Apply partial updates
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    # Validate reminder requires due_date
    if task.reminder_offset_minutes and not task.due_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Reminder requires a due date"
        )

    # Recalculate remind_at if needed
    if task.due_date and task.reminder_offset_minutes:
        task.remind_at = calculate_remind_at(task.due_date, task.reminder_offset_minutes)
    else:
        task.remind_at = None

    # Update timestamp
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    # Publish task.updated event
    publish_task_event(
        event_type="task.updated",
        user_id=user_id,
        task_data=task.model_dump(mode="json"),
    )

    # Publish reminder.scheduled event if reminder is set
    if task.remind_at and task.due_date:
        publish_reminder_event(
            user_id=user_id,
            task_id=str(task.id),
            task_title=task.title,
            due_date=task.due_date,
            remind_at=task.remind_at,
        )

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    session: Session = Depends(get_session),
    user_id: str = Depends(get_current_user),
) -> None:
    """
    Delete a task.

    US5: Authenticated User Deletes Their Task
    - Permanently removes the task
    - Publishes task.deleted event
    - Returns 204 on success (no content)
    - Returns 401 if not authenticated
    - Returns 403 if task belongs to different user
    - Returns 404 if task not found
    """
    task = get_task_or_404(task_id, session, user_id)

    # Capture task data before deletion for event
    task_data = task.model_dump(mode="json")

    session.delete(task)
    session.commit()

    # Publish task.deleted event
    publish_task_event(
        event_type="task.deleted",
        user_id=user_id,
        task_data=task_data,
    )

    return None


@router.patch("/{task_id}/complete", response_model=CompleteTaskResponse)
def complete_task(
    task_id: UUID,
    session: Session = Depends(get_session),
    user_id: str = Depends(get_current_user),
) -> CompleteTaskResponse:
    """
    Complete a task.

    US5 (Recurring): Complete task and create next occurrence if recurring
    - Sets task status to completed
    - If recurring, creates next task with advanced due date
    - Publishes task.completed event
    - If recurring, also publishes task.created for next occurrence
    - Returns completed task and next task (if recurring)
    """
    task = get_task_or_404(task_id, session, user_id)

    # Mark as completed
    task.status = TaskStatus.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    # Publish task.completed event
    publish_task_event(
        event_type="task.completed",
        user_id=user_id,
        task_data=task.model_dump(mode="json"),
    )

    # Create next occurrence if recurring
    next_task = None
    if task.is_recurring and task.recurrence_rule:
        # Calculate next due date
        next_due_date = calculate_next_due_date(task.due_date, task.recurrence_rule)

        # Calculate remind_at for next occurrence
        next_remind_at = None
        if next_due_date and task.reminder_offset_minutes:
            next_remind_at = calculate_remind_at(next_due_date, task.reminder_offset_minutes)

        # Create next task
        next_task = Task(
            title=task.title,
            description=task.description,
            status=TaskStatus.pending,
            priority=task.priority,
            due_date=next_due_date,
            user_id=user_id,
            tags=task.tags.copy() if task.tags else [],
            reminder_offset_minutes=task.reminder_offset_minutes,
            remind_at=next_remind_at,
            is_recurring=True,
            recurrence_rule=task.recurrence_rule,
            parent_task_id=task.id,  # Link to completed task
        )

        session.add(next_task)
        session.commit()
        session.refresh(next_task)

        # Publish task.created event for next occurrence
        publish_task_event(
            event_type="task.created",
            user_id=user_id,
            task_data=next_task.model_dump(mode="json"),
        )

        # Publish reminder.scheduled event for next occurrence if reminder is set
        if next_remind_at and next_due_date:
            publish_reminder_event(
                user_id=user_id,
                task_id=str(next_task.id),
                task_title=next_task.title,
                due_date=next_due_date,
                remind_at=next_remind_at,
            )

    return CompleteTaskResponse(
        completed_task=task,
        next_task=next_task,
    )
