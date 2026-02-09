"""
Chat Pydantic schemas for request/response validation.
Based on specs/004-ai-chatbot-mcp/contracts/chat-api.yaml
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from uuid import UUID


class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""
    message: str = Field(..., min_length=1, max_length=4000, description="User's natural language message")
    stream: bool = Field(default=False, description="Whether to stream the response via SSE")


class ToolInvocation(BaseModel):
    """Schema for MCP tool invocation result."""
    tool_name: str = Field(..., description="Name of the MCP tool invoked")
    success: bool = Field(..., description="Whether the tool execution succeeded")
    result: Optional[Any] = Field(default=None, description="Tool execution result")
    error: Optional[str] = Field(default=None, description="Error message if tool failed")


class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""
    message: str = Field(..., description="AI-generated response message")
    tools_invoked: List[ToolInvocation] = Field(default_factory=list, description="List of MCP tools invoked")
    conversation_id: Optional[UUID] = Field(default=None, description="Conversation identifier")
