"""
MCP Tool: update_task
Updates task properties.
"""
from typing import Dict, Any, Optional
from datetime import datetime
from uuid import UUID
from sqlmodel import Session, select

from app.database import engine
from app.models import Task, TaskStatus, TaskPriority


async def update_task_handler(
    user_id: str,
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    due_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update task properties.

    Args:
        user_id: User ID from JWT (required for isolation)
        task_id: Task ID to update (UUID)
        title: New title (optional)
        description: New description (optional)
        status: New status (optional)
        priority: New priority (optional)
        due_date: New due date in ISO 8601 (optional, use "null" to clear)

    Returns:
        Dict with success status and updated task or error
    """
    # Validate task_id format
    try:
        task_uuid = UUID(task_id)
    except ValueError:
        return {
            "success": False,
            "error": f"Invalid task ID format: {task_id}"
        }

    with Session(engine) as session:
        # Find task by ID
        statement = select(Task).where(Task.id == task_uuid)
        task = session.exec(statement).first()

        if not task:
            return {
                "success": False,
                "error": f"Task not found: {task_id}"
            }

        # Verify user ownership
        if task.user_id != user_id:
            return {
                "success": False,
                "error": "You don't have access to this task"
            }

        # Apply updates
        if title is not None:
            if not title.strip():
                return {
                    "success": False,
                    "error": "Title cannot be empty"
                }
            if len(title) > 255:
                return {
                    "success": False,
                    "error": "Title must be 255 characters or less"
                }
            task.title = title.strip()

        if description is not None:
            if len(description) > 2000:
                return {
                    "success": False,
                    "error": "Description must be 2000 characters or less"
                }
            task.description = description.strip() if description else None

        if status is not None:
            try:
                task.status = TaskStatus(status.lower())
            except ValueError:
                return {
                    "success": False,
                    "error": f"Invalid status: {status}. Must be pending, in_progress, or completed"
                }

        if priority is not None:
            try:
                task.priority = TaskPriority(priority.lower())
            except ValueError:
                return {
                    "success": False,
                    "error": f"Invalid priority: {priority}. Must be low, medium, or high"
                }

        if due_date is not None:
            if due_date.lower() == "null" or due_date == "":
                task.due_date = None
            else:
                try:
                    task.due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
                except ValueError:
                    return {
                        "success": False,
                        "error": f"Invalid due_date format: {due_date}. Use ISO 8601 format"
                    }

        task.updated_at = datetime.utcnow()
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
UPDATE_TASK_DEFINITION = {
    "name": "update_task",
    "description": "Update a task's properties like title, description, status, priority, or due date.",
    "parameters": {
        "type": "object",
        "required": ["task_id"],
        "properties": {
            "task_id": {
                "type": "string",
                "description": "The UUID of the task to update"
            },
            "title": {
                "type": "string",
                "description": "New task title (max 255 characters)"
            },
            "description": {
                "type": "string",
                "description": "New task description (max 2000 characters)"
            },
            "status": {
                "type": "string",
                "enum": ["pending", "in_progress", "completed"],
                "description": "New task status"
            },
            "priority": {
                "type": "string",
                "enum": ["low", "medium", "high"],
                "description": "New task priority"
            },
            "due_date": {
                "type": "string",
                "description": "New due date in ISO 8601 format, or 'null' to clear"
            }
        }
    }
}
