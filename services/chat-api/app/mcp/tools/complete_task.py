"""
MCP Tool: complete_task
Marks a task as completed.
"""
from typing import Dict, Any
from datetime import datetime
from uuid import UUID
from sqlmodel import Session, select

from app.database import engine
from app.models import Task, TaskStatus


async def complete_task_handler(
    user_id: str,
    task_id: str
) -> Dict[str, Any]:
    """
    Mark a task as completed.

    Args:
        user_id: User ID from JWT (required for isolation)
        task_id: Task ID to complete (UUID)

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

        # Update task status
        task.status = TaskStatus.completed
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
COMPLETE_TASK_DEFINITION = {
    "name": "complete_task",
    "description": "Mark a task as completed. Use this when the user says they finished, completed, or done with a task.",
    "parameters": {
        "type": "object",
        "required": ["task_id"],
        "properties": {
            "task_id": {
                "type": "string",
                "description": "The UUID of the task to mark as completed"
            }
        }
    }
}
