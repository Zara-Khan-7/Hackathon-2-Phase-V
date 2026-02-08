"""
MCP (Model Context Protocol) module for AI-Native Todo Chatbot.
Exposes task management tools to the AI agent.
"""
from app.mcp.server import mcp_server, MCPServer
from app.mcp.tools import register_all_tools

__all__ = ["mcp_server", "MCPServer", "register_all_tools"]
