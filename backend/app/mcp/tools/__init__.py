"""
MCP Tools registration module.
Imports and registers all task management tools with the MCP server.
"""
from app.mcp.server import mcp_server

# Tool imports
from app.mcp.tools.add_task import add_task_handler, ADD_TASK_DEFINITION
from app.mcp.tools.list_tasks import list_tasks_handler, LIST_TASKS_DEFINITION
from app.mcp.tools.complete_task import complete_task_handler, COMPLETE_TASK_DEFINITION
from app.mcp.tools.update_task import update_task_handler, UPDATE_TASK_DEFINITION
from app.mcp.tools.delete_task import delete_task_handler, DELETE_TASK_DEFINITION


def register_all_tools() -> None:
    """
    Register all MCP tools with the server.
    Called during application startup.
    """
    # Register add_task tool
    mcp_server.register_tool(
        name=ADD_TASK_DEFINITION["name"],
        description=ADD_TASK_DEFINITION["description"],
        parameters=ADD_TASK_DEFINITION["parameters"],
        handler=add_task_handler
    )

    # Register list_tasks tool
    mcp_server.register_tool(
        name=LIST_TASKS_DEFINITION["name"],
        description=LIST_TASKS_DEFINITION["description"],
        parameters=LIST_TASKS_DEFINITION["parameters"],
        handler=list_tasks_handler
    )

    # Register complete_task tool
    mcp_server.register_tool(
        name=COMPLETE_TASK_DEFINITION["name"],
        description=COMPLETE_TASK_DEFINITION["description"],
        parameters=COMPLETE_TASK_DEFINITION["parameters"],
        handler=complete_task_handler
    )

    # Register update_task tool
    mcp_server.register_tool(
        name=UPDATE_TASK_DEFINITION["name"],
        description=UPDATE_TASK_DEFINITION["description"],
        parameters=UPDATE_TASK_DEFINITION["parameters"],
        handler=update_task_handler
    )

    # Register delete_task tool
    mcp_server.register_tool(
        name=DELETE_TASK_DEFINITION["name"],
        description=DELETE_TASK_DEFINITION["description"],
        parameters=DELETE_TASK_DEFINITION["parameters"],
        handler=delete_task_handler
    )


__all__ = ["register_all_tools", "mcp_server"]
