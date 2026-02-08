# Quickstart: AI-Native Todo Chatbot

**Feature**: 004-ai-chatbot-mcp
**Time**: ~15 minutes to get running locally

## Prerequisites

- Python 3.11+
- Node.js 18+
- Neon PostgreSQL database (from Phase II)
- OpenAI API key
- Better Auth configured (from Phase II)

## 1. Environment Setup

### Backend (.env)

Add these variables to `backend/.env`:

```env
# Existing from Phase II
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-shared-secret

# New for Phase III
OPENAI_API_KEY=sk-your-openai-api-key
```

### Frontend (.env.local)

Add to `frontend/.env.local`:

```env
# Existing from Phase II
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-shared-secret

# New for Phase III (if using ChatKit domain feature)
NEXT_PUBLIC_CHATKIT_DOMAIN=localhost
```

## 2. Install Dependencies

### Backend

```bash
cd backend
pip install -r requirements.txt
```

New dependencies added:
- `mcp>=1.0.0` - MCP SDK
- `openai>=1.0.0` - OpenAI Agents SDK
- `sse-starlette>=1.0` - Server-Sent Events

### Frontend

```bash
cd frontend
npm install
```

New dependency:
- `@openai/chatkit` - Chat UI components

## 3. Database Migration

Run migration to add Conversation and Message tables:

```bash
cd backend
python -m app.migrate  # or alembic upgrade head
```

This creates:
- `conversation` table (user chat sessions)
- `message` table (chat history)

## 4. Start Services

### Terminal 1: Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

## 5. Verify Setup

### Test Chat Endpoint

```bash
# Get JWT token first (login via frontend or use existing token)
TOKEN="your-jwt-token"

# Send a chat message
curl -X POST http://localhost:8000/api/your-user-id/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello! Can you help me manage my tasks?"}'
```

Expected response:
```json
{
  "message": "Hello! I'm your task management assistant. I can help you create, view, update, and complete tasks. What would you like to do?",
  "tools_invoked": [],
  "conversation_id": "..."
}
```

### Test Task Creation via Chat

```bash
curl -X POST http://localhost:8000/api/your-user-id/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to buy groceries tomorrow"}'
```

Expected response:
```json
{
  "message": "Done! I've created a task 'buy groceries' due tomorrow. Is there anything else?",
  "tools_invoked": [
    {
      "tool_name": "add_task",
      "success": true,
      "result": {"id": "...", "title": "buy groceries", "status": "pending"}
    }
  ]
}
```

## 6. Access Chat UI

1. Open http://localhost:3000 in browser
2. Log in with your account
3. Navigate to the Chat page (new in Phase III)
4. Start chatting with natural language!

## Example Conversations

### Create Tasks
- "Add a task to finish the quarterly report"
- "Create a high priority task: call the client"
- "Remind me to submit expenses by Friday"

### View Tasks
- "Show me my tasks"
- "What tasks are pending?"
- "List completed tasks"

### Complete Tasks
- "Mark buy groceries as done"
- "I finished the quarterly report"
- "Complete call the client"

### Update Tasks
- "Change the deadline for quarterly report to next Monday"
- "Make submit expenses high priority"
- "Rename 'call client' to 'call John'"

### Delete Tasks
- "Delete the buy groceries task"
- "Remove all completed tasks"

## Troubleshooting

### "Unauthorized" Error (401)
- Ensure JWT token is valid and not expired
- Check BETTER_AUTH_SECRET matches in frontend and backend

### "Forbidden" Error (403)
- User ID in path must match JWT sub claim
- Ensure you're accessing your own resources

### Empty Response from AI
- Verify OPENAI_API_KEY is set correctly
- Check OpenAI API has credits/quota

### Database Connection Error
- Verify DATABASE_URL is correct
- Ensure Neon database is accessible
- Run migrations if tables don't exist

### Chat UI Not Loading
- Check frontend is running on correct port
- Verify NEXT_PUBLIC_BACKEND_URL points to backend
- Check browser console for CORS errors

## Architecture Verification

After setup, verify these constitution requirements:

- [ ] Chat endpoint responds at `/api/{user_id}/chat`
- [ ] JWT authentication required for all requests
- [ ] User can only access their own tasks
- [ ] MCP tools execute task operations
- [ ] Conversation persists after page refresh
- [ ] No in-memory state (restart backend, conversation still works)
