# Animation Showcase - Phase III Todo Chatbot

Visual guide to all animations implemented in the chat interface.

---

## 1. Message Entrance Animations

### User Messages (Slide from Right)
```
┌────────────────────────────────────┐
│                                    │
│                  ┌────────────┐ ← │  Initial: opacity: 0, translateX(20px)
│                  │ User msg   │   │  Final:   opacity: 1, translateX(0)
│                  └────────────┘   │  Duration: 300ms
│                                    │  Easing: cubic-bezier(0.16, 1, 0.3, 1)
└────────────────────────────────────┘
```

### Assistant Messages (Slide from Left)
```
┌────────────────────────────────────┐
│                                    │
│ →  ┌────────────┐                  │  Initial: opacity: 0, translateX(-20px)
│    │ AI reply   │                  │  Final:   opacity: 1, translateX(0)
│    └────────────┘                  │  Duration: 300ms
│                                    │  Easing: cubic-bezier(0.16, 1, 0.3, 1)
└────────────────────────────────────┘
```

**Code**:
```tsx
// User
<div className="animate-slide-in-right">...</div>

// Assistant
<div className="animate-slide-in-left">...</div>
```

---

## 2. Typing Indicator

### Animated Dots
```
Frame 1:  ●  ○  ○     Frame 2:  ○  ●  ○     Frame 3:  ○  ○  ●
          ↑              ↑                     ↑
        Active         Active                Active

Animation: Vertical bounce with opacity change
Duration: 1.4s per cycle (infinite loop)
Delay: 0ms, 200ms, 400ms (staggered)
```

**Visual Effect**:
- Each dot bounces 8px upward
- Opacity: 0.25 (rest) → 1.0 (peak)
- Smooth, continuous wave motion

**Code**:
```tsx
<div className="flex items-center gap-1.5">
  <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-typing-dot"
       style={{ animationDelay: "0ms" }} />
  <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-typing-dot"
       style={{ animationDelay: "0.2s" }} />
  <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-typing-dot"
       style={{ animationDelay: "0.4s" }} />
</div>
```

---

## 3. Empty State Choreography

### Staggered Reveal Sequence
```
Step 1 (0ms):     ┌─────┐
                  │  💬  │  Icon bounces in
                  └─────┘  (bounce-in, 600ms)

Step 2 (100ms):   Start a conversation
                  (fade-in, 300ms)

Step 3 (200ms):   I can help you manage tasks...
                  (fade-in, 300ms)

Step 4 (300ms):   • "Add a task..."      ↑
                  (slide-up, 400ms)

Step 5 (400ms):   • "Show my tasks..."   ↑
                  (slide-up, 400ms)

Step 6 (500ms):   • "Mark task done..."  ↑
                  (slide-up, 400ms)
```

**Total Duration**: ~900ms (600ms icon + 300ms overlap)

**Code**:
```tsx
<div className="animate-fade-in-up">
  <div className="animate-bounce-in">
    <Icon />
  </div>
  <h3 className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
    Title
  </h3>
  <p className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
    Description
  </p>
  <li className="animate-slide-up" style={{ animationDelay: "0.3s" }}>Item 1</li>
  <li className="animate-slide-up" style={{ animationDelay: "0.4s" }}>Item 2</li>
  <li className="animate-slide-up" style={{ animationDelay: "0.5s" }}>Item 3</li>
</div>
```

---

## 4. Button Interactions

### Send Button States

**Rest → Hover → Active → Rest**

```
Rest:           Hover:          Active:         Rest:
┌──────┐       ┌──────┐       ┌─────┐         ┌──────┐
│ Send │  →    │ Send │  →    │Send │    →    │ Send │
└──────┘       └──────┘       └─────┘         └──────┘
Normal         Darker +       Scale: 0.95     Back to
scale          Shadow         (pressed)       normal
```

**Transitions**:
- Hover: background-color 200ms, shadow 200ms
- Active: transform 100ms (scale down)
- Release: transform 100ms (scale up)

**Code**:
```tsx
<button className="
  bg-blue-600
  hover:bg-blue-700 hover:shadow-md
  active:scale-95
  transition-all duration-200
">
  Send
</button>
```

---

## 5. Input Focus Animation

### Focus Ring Expansion

```
Unfocused:
┌─────────────────────────────────┐
│ Type a message...               │
└─────────────────────────────────┘
Border: gray-300, no ring

       ↓ Click/Tab (200ms transition)

Focused:
┌═════════════════════════════════┐
║ |                               ║  ← Ring (blue, 20% opacity)
└═════════════════════════════════┘
Border: blue-500, ring visible
```

**Properties Animated**:
- Border color: gray-300 → blue-500
- Box shadow: none → 0 0 0 2px rgba(blue, 0.2)
- Transition: all 200ms ease-out

**Code**:
```tsx
<input className="
  border border-gray-300
  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
  transition-all duration-200
" />
```

---

## 6. Alert/Error Slide-Down

### Error Message Appearance

```
Before:
┌────────────────────────────────────┐
│                                    │
│                                    │
│    Chat messages here...           │
│                                    │

After (slides down from top):
┌────────────────────────────────────┐
│  ⚠️  Error: Failed to send        │ ← Slides down (10px)
├────────────────────────────────────┤   Duration: 400ms
│                                    │
│    Chat messages here...           │
│                                    │
```

**Animation**:
- Initial: `translateY(-10px)`, `opacity: 0`
- Final: `translateY(0)`, `opacity: 1`
- Red background with icon
- Smooth slide-down effect

**Code**:
```tsx
<div className="bg-red-50 border border-red-200 animate-slide-down">
  <svg>...</svg>
  <span>{error}</span>
</div>
```

---

## 7. Badge/Tag Scale-In

### Tool Call Badges

```
Initial (invisible):
(scale: 0.95, opacity: 0)

    ↓ 200ms scale-in

Final (visible):
┌────────────┐
│ ✓ get_task │  (scale: 1, opacity: 1)
└────────────┘
```

**Effect**: Small zoom-in with fade
**Duration**: 200ms
**Easing**: smooth (cubic-bezier)

**Code**:
```tsx
<span className="
  inline-flex items-center gap-1
  bg-green-100 text-green-800
  rounded-full px-2 py-0.5
  animate-scale-in
">
  ✓ Success
</span>
```

---

## 8. Hover Effects

### Message Hover Lift

```
Rest:                    Hover:
┌─────────────┐         ┌─────────────┐
│ Message     │    →    │ Message     │  ↑ 2px lift
└─────────────┘         └─────────────┘
Shadow: subtle          Shadow: enhanced
```

**Properties**:
- Transform: `translateY(0)` → `translateY(-2px)`
- Shadow: subtle → more prominent
- Transition: 200ms smooth

**Code**:
```tsx
<div className="hover-lift transition-smooth shadow-sm">
  Content
</div>
```

---

## 9. Loading States

### Spinner Animation

```
   ↻        Continuously rotating
  ╱ ╲       Duration: 1s (built-in)
 ╱   ╲      Easing: linear (infinite)
╱     ╲
```

**Code**:
```tsx
<svg className="h-5 w-5 animate-spin">
  <circle className="opacity-25" ... />
  <path className="opacity-75" ... />
</svg>
```

### Skeleton Loader (Pulse)

```
██████████░░░░░     Pulsing opacity
███████░░░░░░░░     Duration: 2s (built-in)
█████░░░░░░░░░░     Easing: cubic-bezier
```

**Code**:
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded" />
</div>
```

---

## 10. Page Load Animation

### Header Slide-Down

```
Initial (page load):
─────────────────────  ← Header hidden above viewport
                       (translateY: -10px, opacity: 0)

       ↓ 400ms slide-down

Final:
┏━━━━━━━━━━━━━━━━━┓  ← Header slides into view
┃ AI Task Assistant ┃     (translateY: 0, opacity: 1)
┗━━━━━━━━━━━━━━━━━┛
```

**Code**:
```tsx
<header className="animate-slide-down">
  ...
</header>
```

---

## Animation Timing Comparison

### Visual Timeline (0-600ms)

```
Button Press:    ████ (100ms)
Scale-In:        ███████ (200ms)
Transitions:     ███████ (200ms)
Fade-In:         ████████████ (300ms)
Slide-In:        ████████████ (300ms)
Slide-Up:        ██████████████ (400ms)
Bounce-In:       ████████████████████ (600ms)
```

**Guideline**: Most animations complete within 300ms for instant feel.

---

## Easing Curves Visualized

### Smooth (cubic-bezier(0.16, 1, 0.3, 1))
```
Speed
  ^
  │     ╭─────
  │    ╱
  │   ╱
  │  ╱
  │ ╱
  └─────────────> Time
  Fast start, smooth landing
```

### Bouncy (cubic-bezier(0.68, -0.55, 0.265, 1.55))
```
Speed
  ^       ╭╮
  │      ╱  ╲
  │     ╱    ╲
  │    ╱      ╲___
  │   ╱
  └─────────────> Time
  Overshoots, then settles
```

---

## Responsive Behavior

### Desktop vs Mobile

**Desktop**:
- Full animations enabled
- Hover effects active
- Subtle lift on message hover

**Mobile**:
- Touch-optimized (no hover states)
- Same entrance animations
- Active states on tap
- Respects mobile performance

**Reduced Motion**:
- All animations → instant (0.01ms)
- Transitions still work (colors, etc.)
- Accessibility first

---

## Performance Visualization

### GPU Layers

```
Layer 1 (Composite):   Layer 2 (Transform):   Layer 3 (Transform):
┌─────────────────┐   ┌──────────┐           ┌──────────┐
│ Background      │   │ Message  │           │ Button   │
│ (Static)        │   │ (Sliding)│           │ (Scaling)│
└─────────────────┘   └──────────┘           └──────────┘
      CPU                 GPU                     GPU
   No repaint         Composited              Composited
```

**Result**: Smooth 60fps without layout recalculation

---

## Testing Checklist

### Visual Tests
- [ ] Messages slide in from correct direction
- [ ] Typing indicator bounces smoothly
- [ ] Buttons respond to hover/active
- [ ] Focus rings appear smoothly
- [ ] Errors slide down nicely
- [ ] Empty state staggers correctly

### Performance Tests
- [ ] Animations run at 60fps
- [ ] No janky scrolling
- [ ] No layout shifts
- [ ] Mobile performance good

### Accessibility Tests
- [ ] Reduced motion works
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] Keyboard navigation smooth

---

## Quick Animation Reference

| Need | Use | Code |
|------|-----|------|
| Message entrance | `animate-slide-in-{left\|right}` | User/Assistant messages |
| List reveal | `animate-slide-up` | Stagger with delays |
| Loading | `animate-typing-dot` | Three dots pattern |
| Badge appear | `animate-scale-in` | Tags, pills |
| Alert | `animate-slide-down` | Errors, notifications |
| Empty state | `animate-fade-in-up` | Main container |
| Button press | `active:scale-95` | All buttons |
| Hover lift | `hover-lift` | Cards, messages |

---

**Remember**: All animations are performance-optimized, accessible, and enhance (not distract from) the user experience.
