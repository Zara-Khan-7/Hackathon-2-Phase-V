"""
MCP Tool: list_tasks
Lists tasks for the user with optional filtering.
"""
from typing import Dict, Any, Optional, List
from sqlmodel import Session, select

from app.database import engine
from app.models import Task, TaskStatus, TaskPriority


async def list_tasks_handler(
    user_id: str,
    status: Optional[str] = "all",
    priority: Optional[str] = "all"
) -> Dict[str, Any]:
    """
    List tasks for the user with optional filtering.

    Args:
        user_id: User ID from JWT (required for isolation)
        status: Filter by status (pending, in_progress, completed, all)
        priority: Filter by priority (low, medium, high, all)

    Returns:
        Dict with success status and list of tasks or error
    """
    with Session(engine) as session:
        # Base query - always filter by user_id for isolation
        statement = select(Task).where(Task.user_id == user_id)

        # Apply status filter
        if status and status.lower() != "all":
            try:
                task_status = TaskStatus(status.lower())
                statement = statement.where(Task.status == task_status)
            except ValueError:
                return {
                    "success": False,
                    "error": f"Invalid status: {status}. Must be pending, in_progress, completed, or all"
                }

        # Apply priority filter
        if priority and priority.lower() != "all":
            try:
                task_priority = TaskPriority(priority.lower())
                statement = statement.where(Task.priority == task_priority)
            except ValueError:
                return {
                    "success": False,
                    "error": f"Invalid priority: {priority}. Must be low, medium, high, or all"
                }

        # Order by created_at descending (newest first)
        statement = statement.order_by(Task.created_at.desc())

        tasks = session.exec(statement).all()

        return {
            "success": True,
            "data": [
                {
                    "id": str(task.id),
                    "title": task.title,
                    "description": task.description,
                    "status": task.status.value,
                    "priority": task.priority.value,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "created_at": task.created_at.isoformat(),
                    "updated_at": task.updated_at.isoformat()
                }
                for task in tasks
            ]
        }


# Tool definition for MCP registration
LIST_TASKS_DEFINITION = {
    "name": "list_tasks",
    "description": "List the user's tasks with optional filtering. Use this to show tasks, find tasks by name, or check what tasks exist.",
    "parameters": {
        "type": "object",
        "required": [],
        "properties": {
            "status": {
                "type": "string",
                "enum": ["pending", "in_progress", "completed", "all"],
                "default": "all",
                "description": "Filter by task status"
            },
            "priority": {
                "type": "string",
                "enum": ["low", "medium", "high", "all"],
                "default": "all",
                "description": "Filter by task priority"
            }
        }
    }
}
