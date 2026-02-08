"""
MCP Tool: delete_task
Deletes a task.
"""
from typing import Dict, Any
from uuid import UUID
from sqlmodel import Session, select

from app.database import engine
from app.models import Task


async def delete_task_handler(
    user_id: str,
    task_id: str
) -> Dict[str, Any]:
    """
    Delete a task.

    Args:
        user_id: User ID from JWT (required for isolation)
        task_id: Task ID to delete (UUID)

    Returns:
        Dict with success status and deleted task info or error
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

        # Store task info before deletion
        deleted_task_title = task.title
        deleted_task_id = str(task.id)

        # Delete the task
        session.delete(task)
        session.commit()

        return {
            "success": True,
            "data": {
                "deleted_id": deleted_task_id,
                "deleted_title": deleted_task_title,
                "message": f"Task '{deleted_task_title}' deleted successfully"
            }
        }


# Tool definition for MCP registration
DELETE_TASK_DEFINITION = {
    "name": "delete_task",
    "description": "Delete a task. Use this when the user wants to remove, delete, or get rid of a task.",
    "parameters": {
        "type": "object",
        "required": ["task_id"],
        "properties": {
            "task_id": {
                "type": "string",
                "description": "The UUID of the task to delete"
            }
        }
    }
}
