# Feature Specification: Advanced Task Management Features

**Feature Branch**: `006-advanced-task-features`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "Advanced task management with priorities, tags, due dates, reminders, recurrence, search, filter, and sort for event-driven Todo Chatbot"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Task Priority (Priority: P1)

As a user, I want to assign priority levels to my tasks so that I can focus on what matters most.

**Why this priority**: Priority is the most fundamental organizational feature - it enables users to quickly identify critical work without any external dependencies. Already partially implemented in the existing schema.

**Independent Test**: Can be fully tested by creating a task with a priority level, viewing the task list sorted by priority, and verifying visual priority indicators are displayed correctly.

**Acceptance Scenarios**:

1. **Given** a user is creating a new task, **When** they select a priority level (low/medium/high), **Then** the task is saved with the chosen priority and displays the corresponding color badge.
2. **Given** a user has multiple tasks with different priorities, **When** they view the task list, **Then** tasks display priority badges (red=high, yellow=medium, green=low) clearly visible.
3. **Given** a user is editing an existing task, **When** they change the priority, **Then** the update is persisted and the visual indicator updates accordingly.

---

### User Story 2 - Organize Tasks with Tags (Priority: P1)

As a user, I want to add multiple tags to my tasks so that I can categorize and group related work.

**Why this priority**: Tags provide essential cross-cutting organization that complements priorities. Users can group work by project, context, or any custom dimension.

**Independent Test**: Can be fully tested by creating tasks with tags, viewing tag pills on tasks, and filtering by tags.

**Acceptance Scenarios**:

1. **Given** a user is creating or editing a task, **When** they add one or more tags (free-text input), **Then** the tags are saved and displayed as colored pills on the task.
2. **Given** a user has tasks with various tags, **When** they view the task list, **Then** each task shows its associated tags as distinct, readable pills.
3. **Given** a user wants to remove a tag, **When** they click the remove icon on a tag pill during edit, **Then** the tag is removed from the task.
4. **Given** a user adds a tag that already exists in their tag vocabulary, **When** they start typing, **Then** existing tags are suggested for autocomplete (optional enhancement).

---

### User Story 3 - Set Due Dates (Priority: P2)

As a user, I want to set due dates on my tasks so that I can track deadlines and manage my time effectively.

**Why this priority**: Due dates are essential for time-sensitive work and enable reminder functionality. Building block for US4.

**Independent Test**: Can be fully tested by creating tasks with due dates, viewing due date indicators, and observing overdue warnings.

**Acceptance Scenarios**:

1. **Given** a user is creating or editing a task, **When** they select a due date and time using the date picker, **Then** the due date is saved and displayed on the task.
2. **Given** a task has a due date in the future, **When** the user views the task, **Then** the due date is displayed with a countdown or relative time (e.g., "in 2 days").
3. **Given** a task has a due date that has passed, **When** the user views the task, **Then** the task displays an overdue indicator (red color/warning icon).
4. **Given** a user wants to remove a due date, **When** they clear the date field, **Then** the due date is removed and the task no longer shows deadline information.

---

### User Story 4 - Set Reminders (Priority: P2)

As a user, I want to set reminders for my tasks so that I receive notifications before deadlines.

**Why this priority**: Reminders add proactive notifications to due dates. Requires due dates (US3) but delivers high user value. Integrates with event system.

**Independent Test**: Can be fully tested by setting a reminder, verifying the reminder event is published at the correct time (event inspection, not notification delivery).

**Acceptance Scenarios**:

1. **Given** a user is setting a due date on a task, **When** they select a reminder option (10 min, 30 min, 1 hour, 1 day before, or custom), **Then** the reminder preference is saved.
2. **Given** a task has a due date and reminder set, **When** the reminder time is reached, **Then** a reminder event is published to the event system (topic: `reminders`).
3. **Given** a user wants to change their reminder, **When** they select a different reminder option, **Then** the reminder is updated and the new time is used for the event.
4. **Given** a task has no due date, **When** the user tries to set a reminder, **Then** they are prompted to set a due date first (reminder requires due date).

---

### User Story 5 - Create Recurring Tasks (Priority: P3)

As a user, I want to create tasks that automatically repeat on a schedule so that I don't have to manually recreate routine work.

**Why this priority**: Advanced feature that builds on basic task management. Requires more complex logic but delivers significant value for routine tasks.

**Independent Test**: Can be fully tested by creating a recurring task, completing it, and verifying the next occurrence is automatically created.

**Acceptance Scenarios**:

1. **Given** a user is creating a task, **When** they enable recurrence and select a pattern (daily, weekly, monthly, yearly, or custom interval), **Then** the task is saved with the recurrence rule.
2. **Given** a recurring task exists, **When** the user completes it, **Then** a new task is automatically created for the next occurrence with the same properties (except due date advances per pattern).
3. **Given** a recurring task with due date "every Monday", **When** completed on any day, **Then** the next occurrence is created with due date set to the following Monday.
4. **Given** a user wants to stop recurrence, **When** they disable the recurring toggle on the task, **Then** completing the task no longer creates a new occurrence.
5. **Given** a recurring task, **When** displayed in the task list, **Then** a recurring indicator icon is shown to distinguish it from one-time tasks.

---

### User Story 6 - Search Tasks (Priority: P2)

As a user, I want to search my tasks by title and description so that I can quickly find specific work items.

**Why this priority**: Search is fundamental for users with many tasks. Enables quick access without scrolling or filtering.

**Independent Test**: Can be fully tested by entering search terms and verifying matching tasks are returned.

**Acceptance Scenarios**:

1. **Given** a user has multiple tasks, **When** they enter a search term in the search bar, **Then** the task list filters to show only tasks where title or description contains the search term.
2. **Given** a search term that matches multiple tasks, **When** results are displayed, **Then** matching text is highlighted (optional) and results update as user types (debounced).
3. **Given** a search term with no matches, **When** results are displayed, **Then** an empty state message indicates no tasks found.
4. **Given** an active search filter, **When** the user clears the search bar, **Then** all tasks are displayed again.

---

### User Story 7 - Filter Tasks (Priority: P2)

As a user, I want to filter my task list by various criteria so that I can focus on relevant subsets of my work.

**Why this priority**: Filtering complements search by allowing structured narrowing of task lists based on task attributes.

**Independent Test**: Can be fully tested by applying filters and verifying the task list shows only matching tasks.

**Acceptance Scenarios**:

1. **Given** a user views the task list, **When** they select a status filter (all/active/completed), **Then** only tasks matching that status are shown.
2. **Given** a user selects a priority filter (low/medium/high), **When** applied, **Then** only tasks with that priority are shown.
3. **Given** a user selects one or more tags to filter by, **When** applied, **Then** only tasks containing at least one of the selected tags are shown.
4. **Given** a user enables "has due date" filter, **When** applied, **Then** only tasks with a due date are shown.
5. **Given** a user enables "is recurring" filter, **When** applied, **Then** only recurring tasks are shown.
6. **Given** multiple filters are active, **When** viewing the task list, **Then** all filter criteria are combined (AND logic) to narrow results.
7. **Given** active filters, **When** the user clicks "Clear Filters", **Then** all filters are removed and full task list is restored.

---

### User Story 8 - Sort Tasks (Priority: P3)

As a user, I want to sort my task list by different criteria so that I can organize my view based on current needs.

**Why this priority**: Sorting is the final list control that enables flexible task organization. Lower priority as filtering/search often suffice.

**Independent Test**: Can be fully tested by selecting sort options and verifying task order changes accordingly.

**Acceptance Scenarios**:

1. **Given** a user selects "Sort by Due Date", **When** applied (ascending), **Then** tasks are ordered with soonest due dates first, tasks without due dates appear last.
2. **Given** a user selects "Sort by Priority", **When** applied (descending), **Then** high priority tasks appear first, then medium, then low.
3. **Given** a user selects "Sort by Created Date", **When** applied (descending), **Then** newest tasks appear first.
4. **Given** a user selects "Sort by Title", **When** applied (ascending), **Then** tasks are alphabetically ordered by title.
5. **Given** a sort selection, **When** the user toggles ascending/descending, **Then** the order reverses accordingly.

---

### Edge Cases

- What happens when a recurring task has no due date? The recurrence creates next occurrence immediately with no due date.
- How does system handle reminder for task completed before reminder time? Reminder event is cancelled/not published.
- What happens when filtering by tag that has been removed from all tasks? Empty result with clear messaging.
- How does search behave with special characters? Special characters are treated as literal matches, not regex.
- What happens to recurring chain when parent task is deleted? Chain is broken; existing occurrences remain, no new ones created.
- What if user sets reminder time in the past? System rejects or immediately triggers (design choice: reject with validation error).

## Requirements *(mandatory)*

### Functional Requirements

**Priority Management**
- **FR-001**: System MUST allow users to set priority level (low, medium, high) on any task.
- **FR-002**: System MUST display priority as a color-coded badge (high=red, medium=yellow, low=green).
- **FR-003**: System MUST persist priority changes and publish task update events.

**Tag Management**
- **FR-004**: System MUST allow users to add multiple text tags to a task.
- **FR-005**: System MUST store tags as a list associated with the task and user.
- **FR-006**: System MUST display tags as colored pills on task items.
- **FR-007**: System MUST allow removal of individual tags from a task.

**Due Date Management**
- **FR-008**: System MUST allow users to set an optional due date (date and time) on tasks.
- **FR-009**: System MUST display due dates with relative time indicators (e.g., "in 2 days", "overdue").
- **FR-010**: System MUST visually distinguish overdue tasks with warning styling.

**Reminder Management**
- **FR-011**: System MUST allow users to set a reminder relative to due date (10 min, 30 min, 1 hour, 1 day, custom).
- **FR-012**: System MUST publish a reminder event to the `reminders` topic when remind_at time is reached.
- **FR-013**: System MUST require a due date before a reminder can be set.
- **FR-014**: System MUST update or cancel reminder events when task due date or reminder settings change.

**Recurring Tasks**
- **FR-015**: System MUST allow users to enable recurrence with patterns: daily, weekly, monthly, yearly, custom interval.
- **FR-016**: System MUST store recurrence rule as a parseable format (simple string or RRULE).
- **FR-017**: System MUST automatically create next occurrence when a recurring task is completed.
- **FR-018**: System MUST advance due date in next occurrence according to recurrence pattern.
- **FR-019**: System MUST display a recurring indicator on recurring tasks.
- **FR-020**: System MUST publish task creation event for auto-generated recurring task instances.

**Search**
- **FR-021**: System MUST support full-text search across task title and description fields.
- **FR-022**: System MUST return search results in real-time as user types (with reasonable debounce).
- **FR-023**: System MUST display clear empty state when no results match search.

**Filtering**
- **FR-024**: System MUST support filtering by status (all, active, completed).
- **FR-025**: System MUST support filtering by priority level.
- **FR-026**: System MUST support filtering by one or more tags.
- **FR-027**: System MUST support filtering by presence of due date (has/doesn't have).
- **FR-028**: System MUST support filtering by recurrence status (is recurring / not recurring).
- **FR-029**: System MUST combine multiple filters using AND logic.

**Sorting**
- **FR-030**: System MUST support sorting by: created date, due date, priority, title.
- **FR-031**: System MUST support ascending and descending order for each sort field.
- **FR-032**: System MUST handle null values appropriately (e.g., null due dates sort last).

**Event Integration**
- **FR-033**: System MUST publish task CRUD events to `task-events` topic via Dapr Pub/Sub.
- **FR-034**: System MUST include all task fields in event payload including new fields.
- **FR-035**: System MUST publish recurring task creation events when next occurrence is generated.

### Key Entities

- **Task**: Extended with priority (enum), tags (list), due_date (datetime), reminder_offset_minutes (integer), is_recurring (boolean), recurrence_rule (string), parent_task_id (uuid reference for recurring chains).
- **Tag**: Lightweight entity - stored as JSONB array on task or as separate user_tags table for autocomplete.
- **ReminderEvent**: Event payload containing task_id, user_id, remind_at timestamp, task title, due_date.
- **TaskEvent**: Event payload for all task CRUD operations, including event_type, task data, timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a task with all new attributes (priority, tags, due date, reminder, recurrence) in under 60 seconds.
- **SC-002**: Task list displays 100 tasks with full metadata (badges, pills, indicators) and renders completely within 2 seconds.
- **SC-003**: Search returns matching results within 500ms of user stopping typing.
- **SC-004**: Filters can be applied and results refresh within 1 second.
- **SC-005**: When a recurring task is completed, the next occurrence appears in the task list within 3 seconds.
- **SC-006**: 95% of task CRUD operations successfully publish events to Kafka topics.
- **SC-007**: Reminder events are published within 1 minute of the scheduled remind_at time.
- **SC-008**: Users can apply 3+ simultaneous filters and still navigate the interface smoothly.
- **SC-009**: All new features work correctly for users with 500+ tasks in their account.

## Assumptions

1. The existing authentication system (JWT) continues to identify users for all new endpoints.
2. Priority enum already exists in the model and can be leveraged as-is.
3. Due date field already exists in the model as nullable datetime.
4. PostgreSQL JSONB will be used for tags storage for simplicity (no separate tags table initially).
5. Recurrence rules will use simple string format (DAILY, WEEKLY, MONTHLY, YEARLY) initially, with RRULE support as optional enhancement.
6. Reminder scheduling will be handled by a separate service consuming the events (not implemented in this feature scope).
7. WebSocket/real-time sync for UI updates is out of scope - frontend will poll or refresh.
8. Event publishing uses Dapr Pub/Sub building block for Kafka abstraction.

## Out of Scope

- Notification delivery (push notifications, email, SMS) - only event publishing
- WebSocket real-time sync - frontend handles refresh
- Collaborative task sharing between users
- Recurring task frequency limits or billing considerations
- Time zone conversion for due dates (assumed UTC or user-local in frontend)
- Advanced RRULE parsing (e.g., "every 2nd Tuesday of month")
- Batch operations (bulk priority change, bulk tag assignment)

## Dependencies

- Dapr sidecar running for Pub/Sub event publishing
- Kafka/Redpanda broker accessible for topics
- PostgreSQL database for schema changes
- Frontend framework (existing React/Next.js) for UI components
