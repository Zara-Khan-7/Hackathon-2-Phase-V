# Chat UI Animation System

A comprehensive, performance-optimized animation system for the Todo Chatbot interface. All animations are hardware-accelerated using CSS transforms and opacity for buttery-smooth 60fps performance.

## Table of Contents

- [Overview](#overview)
- [Animation Design Principles](#animation-design-principles)
- [Available Animations](#available-animations)
- [Usage Examples](#usage-examples)
- [Performance Optimizations](#performance-optimizations)
- [Accessibility](#accessibility)
- [Animation Library Reference](#animation-library-reference)

---

## Overview

The animation system provides:

- **Hardware-accelerated animations** using `transform` and `opacity` only
- **Consistent timing and easing** across all components
- **Accessibility support** with automatic reduced motion detection
- **Reusable utilities** via `lib/animations.ts`
- **Type-safe API** for TypeScript projects

### Files Modified

1. `frontend/src/app/globals.css` - Animation keyframes and utility classes
2. `frontend/src/components/chat/chat-message.tsx` - Message slide-in animations
3. `frontend/src/components/chat/chat-input.tsx` - Input focus and button animations
4. `frontend/src/components/chat/chat-container.tsx` - Loading states and empty state
5. `frontend/src/app/(protected)/chat/page.tsx` - Header animations
6. `frontend/src/lib/animations.ts` - Reusable animation utilities (NEW)

---

## Animation Design Principles

### 1. Performance First

All animations use only GPU-accelerated properties:
- ✅ `transform` (translateX, translateY, scale)
- ✅ `opacity`
- ❌ NOT width, height, margin, padding (causes layout thrashing)

### 2. Consistent Timing

```css
Fast:     100ms  (button presses)
Normal:   200ms  (standard transitions)
Moderate: 300ms  (slide-ins)
Slow:     400ms  (page transitions)
Slower:   600ms  (emphasis animations)
```

### 3. Natural Easing

```css
Smooth:  cubic-bezier(0.16, 1, 0.3, 1)    /* Most animations */
Bouncy:  cubic-bezier(0.68, -0.55, 0.265, 1.55)  /* Playful emphasis */
```

### 4. Subtle Motion

Animations should enhance, not distract. Most movements are 10-20px, with quick durations.

---

## Available Animations

### Slide Animations

| Class | Effect | Use Case |
|-------|--------|----------|
| `animate-slide-in-right` | Slide from right with fade | User messages |
| `animate-slide-in-left` | Slide from left with fade | Assistant messages |
| `animate-slide-up` | Slide up with fade | List items, staggered reveals |
| `animate-slide-down` | Slide down with fade | Alerts, dropdowns |

### Fade Animations

| Class | Effect | Use Case |
|-------|--------|----------|
| `animate-fade-in` | Simple fade in | Timestamps, subtle elements |
| `animate-fade-in-up` | Fade + slide up | Empty states, sections |

### Scale Animations

| Class | Effect | Use Case |
|-------|--------|----------|
| `animate-scale-in` | Scale up with fade | Badges, pills, tags |
| `animate-bounce-in` | Bouncy scale entrance | Icons, emphasis |

### Special Animations

| Class | Effect | Use Case |
|-------|--------|----------|
| `animate-typing-dot` | Vertical bounce loop | Typing indicators |
| `animate-press` | Quick scale down/up | Button press feedback |

### Utility Classes

| Class | Effect | Use Case |
|-------|--------|----------|
| `transition-smooth` | Transform + opacity transition | Hover effects |
| `transition-colors-smooth` | Color transitions | Button states |
| `hover-lift` | Lift on hover (-2px) | Cards, messages |
| `hover-scale` | Scale on hover (1.02x) | Interactive elements |

---

## Usage Examples

### 1. Chat Messages with Directional Slide-In

```tsx
// User message (from right)
<div className="flex justify-end animate-slide-in-right">
  <div className="bg-blue-600 text-white rounded-lg px-4 py-2">
    User message
  </div>
</div>

// Assistant message (from left)
<div className="flex justify-start animate-slide-in-left">
  <div className="bg-gray-100 rounded-lg px-4 py-2">
    Assistant message
  </div>
</div>
```

### 2. Typing Indicator

```tsx
<div className="flex items-center gap-1.5">
  <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-typing-dot" style={{ animationDelay: "0ms" }} />
  <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-typing-dot" style={{ animationDelay: "0.2s" }} />
  <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-typing-dot" style={{ animationDelay: "0.4s" }} />
</div>
```

### 3. Button with Hover and Active States

```tsx
<button className="
  bg-blue-600 text-white px-4 py-2 rounded-lg
  hover:bg-blue-700 hover:shadow-md
  active:scale-95
  transition-all duration-200
">
  Send Message
</button>
```

### 4. Input with Focus Animation

```tsx
<input className="
  border border-gray-300 rounded-lg px-4 py-2
  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
  transition-all duration-200
" />
```

### 5. Staggered List Animations

```tsx
{items.map((item, index) => (
  <div
    key={index}
    className="animate-slide-up"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {item}
  </div>
))}
```

### 6. Empty State with Choreographed Entrance

```tsx
<div className="animate-fade-in-up">
  <div className="animate-bounce-in">
    <ChatIcon />
  </div>
  <h3 className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
    Start a conversation
  </h3>
  <p className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
    Try asking something...
  </p>
</div>
```

---

## Performance Optimizations

### 1. Hardware Acceleration

All animations use GPU-accelerated properties:

```css
/* ✅ Good - GPU accelerated */
@keyframes slide-in {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* ❌ Bad - Causes layout thrashing */
@keyframes slide-in-bad {
  from { margin-left: 20px; }
  to { margin-left: 0; }
}
```

### 2. Will-Change Optimization (Use Sparingly)

```tsx
// Only for elements that WILL animate
<div className="will-change-[transform,opacity]">
  Animating element
</div>
```

### 3. Reduce Animation Complexity

- Keep animation durations under 600ms
- Limit simultaneous animations
- Use `transform` and `opacity` only
- Avoid animating many elements at once

### 4. Smooth Scrolling

```tsx
// Auto-scroll to new messages
messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
```

---

## Accessibility

### Reduced Motion Support

The system automatically respects user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Using the Hook

```tsx
import { usePrefersReducedMotion } from "@/lib/animations";

function MyComponent() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className={reducedMotion ? "" : "animate-slide-in"}>
      Content
    </div>
  );
}
```

---

## Animation Library Reference

### Import the Library

```tsx
import {
  animationPresets,
  getAnimationClass,
  getStaggerDelay,
  easings,
  durations,
} from "@/lib/animations";
```

### Animation Presets

```tsx
// Pre-configured animations for common patterns
animationPresets.messageUser        // "animate-slide-in-right"
animationPresets.messageAssistant   // "animate-slide-in-left"
animationPresets.buttonPress        // "active:scale-95 transition-transform duration-100"
animationPresets.typingDot          // "animate-typing-dot"
animationPresets.emptyState         // "animate-fade-in-up"
animationPresets.alert              // "animate-slide-down"
animationPresets.badge              // "animate-scale-in"
animationPresets.listItem           // "animate-slide-up"
```

### Staggered Animations Helper

```tsx
import { getStaggerDelay } from "@/lib/animations";

{items.map((item, i) => (
  <div
    key={i}
    className="animate-slide-up"
    style={getStaggerDelay(i, 0, 100)} // 100ms stagger
  >
    {item}
  </div>
))}
```

### Custom Animation Styles

```tsx
import { getAnimationStyles, easings, durations } from "@/lib/animations";

<div style={getAnimationStyles({
  delay: 100,
  duration: durations.moderate,
  easing: "smooth",
  iterations: "infinite"
})}>
  Custom animated element
</div>
```

### Orchestration Utilities

```tsx
import { orchestration } from "@/lib/animations";

// Calculate total animation time
const totalTime = orchestration.calculateStaggerDuration(
  5,    // 5 items
  300,  // 300ms per item
  100,  // 100ms stagger
  0     // no base delay
);
// Returns: 700ms (4 * 100 stagger + 300 duration)

// Generate delay array
const delays = orchestration.generateStaggerDelays(5, 100);
// Returns: [0, 100, 200, 300, 400]
```

---

## Real-World Examples

### Complete Chat Message Component

```tsx
"use client";

import { animationPresets, transitions } from "@/lib/animations";
import { cn } from "@/lib/utils";

export function ChatMessage({ message, isUser }) {
  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
        isUser ? animationPresets.messageUser : animationPresets.messageAssistant
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2 shadow-sm",
          transitions.smooth,
          "hover-lift",
          isUser ? "bg-blue-600 text-white" : "bg-gray-100"
        )}
      >
        <p>{message.content}</p>
        <p className="text-xs mt-1 animate-fade-in">
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}
```

### Interactive Button

```tsx
import { transitions } from "@/lib/animations";

<button
  className={cn(
    "bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm",
    "hover:bg-blue-700 hover:shadow-md",
    animationPresets.buttonPress,
    transitions.all
  )}
>
  Send
</button>
```

---

## Performance Checklist

Before deploying animations, verify:

- [ ] Animations use only `transform` and `opacity`
- [ ] Durations are under 600ms
- [ ] Reduced motion is respected
- [ ] Animations run at 60fps (test with DevTools Performance tab)
- [ ] No layout shifts (test with Layout Shift indicators)
- [ ] Touch targets are 44x44px minimum
- [ ] Animations enhance UX without blocking interaction

---

## Troubleshooting

### Animation Not Playing

1. Check class name spelling
2. Verify element is visible (not `display: none`)
3. Check for conflicting CSS
4. Ensure globals.css is imported

### Janky/Choppy Animations

1. Use transform/opacity only
2. Reduce number of simultaneous animations
3. Check for heavy JavaScript on main thread
4. Profile with Chrome DevTools Performance tab

### Animation Plays on Every Render

Use CSS animations instead of inline styles for better performance:

```tsx
// ❌ Bad - triggers on every render
<div style={{ animation: "slide-in 300ms" }}>

// ✅ Good - CSS class
<div className="animate-slide-in">
```

---

## Browser Support

All animations work in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Graceful degradation for older browsers via `@supports`.

---

## Future Enhancements

Potential improvements:

1. **Framer Motion Integration** - For complex orchestration
2. **Spring Physics** - Natural momentum-based animations
3. **Gesture Support** - Swipe, drag interactions
4. **View Transitions API** - Smooth page transitions (Chrome 111+)
5. **Animation Debugger** - Visual tool to preview animations

---

## Credits

Built with:
- Tailwind CSS v4
- Hardware-accelerated CSS animations
- React 18
- TypeScript

**Performance Philosophy**: Every animation should feel instant, never block user interaction, and respect user preferences.
