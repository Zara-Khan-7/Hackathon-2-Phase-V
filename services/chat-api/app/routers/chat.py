"""
Chat API endpoint for AI-powered task management.
Single stateless endpoint that processes natural language messages.
"""
import json
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from datetime import datetime
from typing import List, Dict, Any

from app.database import get_session
from app.auth.jwt import get_current_user
from app.models import Conversation, Message, MessageRole
from app.schemas import ChatRequest, ChatResponse, ToolInvocation
from app.agent import agent_runner

# Create router
router = APIRouter(
    prefix="/api",
    tags=["Chat"],
)

# Context window size (number of recent messages to load)
CONTEXT_WINDOW_SIZE = 20


def get_or_create_conversation(
    session: Session,
    user_id: str
) -> Conversation:
    """
    Get existing conversation for user or create new one.
    Each user has exactly one conversation.
    """
    statement = select(Conversation).where(Conversation.user_id == user_id)
    conversation = session.exec(statement).first()

    if not conversation:
        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

    return conversation


def load_conversation_history(
    session: Session,
    conversation_id: UUID,
    limit: int = CONTEXT_WINDOW_SIZE
) -> List[Dict[str, str]]:
    """
    Load recent messages from conversation for agent context.

    Args:
        session: Database session
        conversation_id: Conversation UUID
        limit: Maximum messages to load

    Returns:
        List of message dicts in OpenAI format
    """
    statement = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    messages = session.exec(statement).all()

    # Reverse to chronological order
    messages = list(reversed(messages))

    return [
        {"role": msg.role.value, "content": msg.content}
        for msg in messages
    ]


def store_message(
    session: Session,
    conversation_id: UUID,
    role: MessageRole,
    content: str,
    tool_calls: List[ToolInvocation] = None
) -> Message:
    """Store a message in the conversation."""
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        tool_calls=json.dumps([t.model_dump() for t in tool_calls]) if tool_calls else None
    )
    session.add(message)
    session.commit()
    session.refresh(message)
    return message


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: str,
    request: ChatRequest,
    session: Session = Depends(get_session),
    current_user_id: str = Depends(get_current_user),
):
    """
    Process a natural language chat message.

    The AI agent interprets the message, invokes MCP tools as needed,
    and generates a natural language response.

    - Requires JWT authentication
    - user_id in path must match JWT sub claim
    - Conversation history persists across requests
    - Supports streaming responses via SSE
    """
    # Validate user_id matches JWT
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )

    # Get or create conversation
    conversation = get_or_create_conversation(session, user_id)

    # Load conversation history for context
    history = load_conversation_history(session, conversation.id)

    # Store user message
    store_message(session, conversation.id, MessageRole.user, request.message)

    # Update conversation timestamp
    conversation.updated_at = datetime.utcnow()
    session.add(conversation)
    session.commit()

    # Handle streaming response
    if request.stream:
        return StreamingResponse(
            stream_response(user_id, request.message, history, conversation, session),
            media_type="text/event-stream"
        )

    # Non-streaming response
    response_message, tools_invoked = await agent_runner.run(
        user_message=request.message,
        user_id=user_id,
        conversation_history=history
    )

    # Store assistant response
    store_message(
        session,
        conversation.id,
        MessageRole.assistant,
        response_message,
        tools_invoked
    )

    return ChatResponse(
        message=response_message,
        tools_invoked=tools_invoked,
        conversation_id=conversation.id
    )


async def stream_response(
    user_id: str,
    message: str,
    history: List[Dict[str, str]],
    conversation: Conversation,
    session: Session
):
    """
    Generator for streaming chat responses via SSE.
    """
    full_content = ""
    tools_invoked = []

    async for chunk in agent_runner.run_stream(
        user_message=message,
        user_id=user_id,
        conversation_history=history
    ):
        if chunk["type"] == "tool_invocation":
            tools_invoked.append(ToolInvocation(**chunk["data"]))
            yield f"data: {json.dumps(chunk)}\n\n"

        elif chunk["type"] == "content":
            full_content += chunk["data"]
            yield f"data: {json.dumps(chunk)}\n\n"

        elif chunk["type"] == "done":
            # Store the complete assistant response
            store_message(
                session,
                conversation.id,
                MessageRole.assistant,
                full_content,
                tools_invoked
            )
            yield f"data: {json.dumps(chunk)}\n\n"

    yield "data: [DONE]\n\n"
