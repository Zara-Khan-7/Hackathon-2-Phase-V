"""
MCP Tool: add_task
Creates a new task for the user.
"""
from typing import Dict, Any, Optional
from datetime import datetime
from sqlmodel import Session

from app.database import engine
from app.models import Task, TaskPriority


async def add_task_handler(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    priority: Optional[str] = "medium",
    due_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new task for the user.

    Args:
        user_id: User ID from JWT (required for isolation)
        title: Task title (required, max 255 chars)
        description: Optional task description (max 2000 chars)
        priority: Task priority (low, medium, high)
        due_date: Optional due date in ISO 8601 format

    Returns:
        Dict with success status and task data or error
    """
    # Input validation
    if not title or not title.strip():
        return {
            "success": False,
            "error": "Title is required"
        }

    if len(title) > 255:
        return {
            "success": False,
            "error": "Title must be 255 characters or less"
        }

    if description and len(description) > 2000:
        return {
            "success": False,
            "error": "Description must be 2000 characters or less"
        }

    # Validate priority
    try:
        task_priority = TaskPriority(priority.lower()) if priority else TaskPriority.medium
    except ValueError:
        return {
            "success": False,
            "error": f"Invalid priority: {priority}. Must be low, medium, or high"
        }

    # Parse due_date if provided
    parsed_due_date = None
    if due_date:
        try:
            parsed_due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
        except ValueError:
            return {
                "success": False,
                "error": f"Invalid due_date format: {due_date}. Use ISO 8601 format"
            }

    # Create task in database
    with Session(engine) as session:
        task = Task(
            title=title.strip(),
            description=description.strip() if description else None,
            priority=task_priority,
            due_date=parsed_due_date,
            user_id=user_id
        )
        session.add(task)
        session.commit()
        session.refresh(task)

        return {
            "success": True,
            "data": {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "status": task.status.value,
                "priority": task.priority.value,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
        }


# Tool definition for MCP registration
ADD_TASK_DEFINITION = {
    "name": "add_task",
    "description": "Create a new task for the user. Use this when the user wants to add, create, or make a new task.",
    "parameters": {
        "type": "object",
        "required": ["title"],
        "properties": {
            "title": {
                "type": "string",
                "description": "Task title (max 255 characters)"
            },
            "description": {
                "type": "string",
                "description": "Optional task description (max 2000 characters)"
            },
            "priority": {
                "type": "string",
                "enum": ["low", "medium", "high"],
                "default": "medium",
                "description": "Task priority level"
            },
            "due_date": {
                "type": "string",
                "description": "Due date in ISO 8601 format (e.g., 2026-01-20T18:00:00Z)"
            }
        }
    }
}
