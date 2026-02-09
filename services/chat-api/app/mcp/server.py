"""
MCP Server initialization for AI-Native Todo Chatbot.
Exposes task management tools to the AI agent via MCP protocol.
"""
from typing import Dict, Any, Callable
import json


class MCPServer:
    """
    MCP (Model Context Protocol) Server for task management.

    This server exposes tools that the AI agent can invoke to perform
    task CRUD operations. All tools enforce user isolation via user_id.
    """

    def __init__(self):
        self._tools: Dict[str, Dict[str, Any]] = {}

    def register_tool(
        self,
        name: str,
        description: str,
        parameters: Dict[str, Any],
        handler: Callable
    ) -> None:
        """
        Register a tool with the MCP server.

        Args:
            name: Tool name (e.g., 'add_task')
            description: Human-readable description
            parameters: JSON Schema for tool parameters
            handler: Async function to execute when tool is called
        """
        self._tools[name] = {
            "name": name,
            "description": description,
            "parameters": parameters,
            "handler": handler
        }

    def get_tool_definitions(self) -> list:
        """
        Get tool definitions in OpenAI function calling format.

        Returns:
            List of tool definitions for AI agent.
        """
        return [
            {
                "type": "function",
                "function": {
                    "name": tool["name"],
                    "description": tool["description"],
                    "parameters": tool["parameters"]
                }
            }
            for tool in self._tools.values()
        ]

    async def execute_tool(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a registered tool.

        Args:
            name: Tool name to execute
            arguments: Tool arguments

        Returns:
            Tool execution result
        """
        if name not in self._tools:
            return {
                "success": False,
                "error": f"Unknown tool: {name}"
            }

        tool = self._tools[name]
        try:
            result = await tool["handler"](**arguments)
            return result
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def get_tool_names(self) -> list:
        """Get list of registered tool names."""
        return list(self._tools.keys())


# Global MCP server instance
mcp_server = MCPServer()
