# Animation Quick Reference Card

## Common Patterns (Copy & Paste Ready)

### Message Animations

```tsx
// User message (slide from right)
<div className="flex justify-end animate-slide-in-right">
  <div className="bg-blue-600 text-white rounded-lg px-4 py-2 shadow-sm hover-lift">
    {content}
  </div>
</div>

// Assistant message (slide from left)
<div className="flex justify-start animate-slide-in-left">
  <div className="bg-gray-100 rounded-lg px-4 py-2 shadow-sm hover-lift">
    {content}
  </div>
</div>
```

### Typing Indicator

```tsx
<div className="flex items-center gap-1.5">
  <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-typing-dot" style={{ animationDelay: "0ms" }} />
  <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-typing-dot" style={{ animationDelay: "0.2s" }} />
  <div className="h-2.5 w-2.5 rounded-full bg-gray-400 animate-typing-dot" style={{ animationDelay: "0.4s" }} />
</div>
```

### Buttons

```tsx
// Primary button with animations
<button className="
  bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm
  hover:bg-blue-700 hover:shadow-md active:scale-95
  transition-all duration-200
">
  Send
</button>

// Secondary button
<button className="
  bg-gray-100 text-gray-700 px-4 py-2 rounded-lg
  hover:bg-gray-200 active:scale-95
  transition-all duration-200
">
  Cancel
</button>
```

### Input Fields

```tsx
<input className="
  border border-gray-300 rounded-lg px-4 py-2.5
  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
  transition-all duration-200
  placeholder:text-gray-400
" />

<textarea className="
  border border-gray-300 rounded-lg px-4 py-2.5
  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
  transition-all duration-200
  resize-none
" />
```

### Loading States

```tsx
// Spinner
<svg className="h-5 w-5 animate-spin">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
</svg>

// Skeleton loader
<div className="animate-pulse space-y-3">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

### Alerts/Notifications

```tsx
// Error
<div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-slide-down">
  <div className="flex items-center gap-2 text-red-700">
    <svg className="h-4 w-4">...</svg>
    <span>{error}</span>
  </div>
</div>

// Success
<div className="bg-green-50 border border-green-200 rounded-lg p-3 animate-slide-down">
  <div className="flex items-center gap-2 text-green-700">
    <svg className="h-4 w-4">...</svg>
    <span>{success}</span>
  </div>
</div>
```

### Empty States

```tsx
<div className="flex flex-col items-center justify-center text-center animate-fade-in-up">
  <div className="rounded-full bg-blue-100 p-4 animate-bounce-in">
    <Icon className="h-8 w-8 text-blue-600" />
  </div>
  <h3 className="mt-4 text-lg font-medium animate-fade-in" style={{ animationDelay: "0.1s" }}>
    Title
  </h3>
  <p className="mt-2 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: "0.2s" }}>
    Description
  </p>
</div>
```

### Staggered Lists

```tsx
{items.map((item, i) => (
  <div
    key={i}
    className="animate-slide-up"
    style={{ animationDelay: `${i * 100}ms` }}
  >
    {item}
  </div>
))}
```

### Badges/Tags

```tsx
<span className="
  inline-flex items-center gap-1 px-2 py-0.5 rounded-full
  bg-green-100 text-green-800 text-xs font-medium
  animate-scale-in
">
  Active
</span>
```

### Cards with Hover

```tsx
<div className="
  bg-white rounded-lg p-4 border shadow-sm
  hover-lift transition-smooth
">
  {content}
</div>
```

---

## Animation Classes Cheat Sheet

| Class | Effect | Duration |
|-------|--------|----------|
| `animate-slide-in-right` | Slide from right + fade | 300ms |
| `animate-slide-in-left` | Slide from left + fade | 300ms |
| `animate-slide-up` | Slide up + fade | 400ms |
| `animate-slide-down` | Slide down + fade | 400ms |
| `animate-fade-in` | Fade in | 300ms |
| `animate-fade-in-up` | Fade + slide up | 400ms |
| `animate-scale-in` | Scale up + fade | 200ms |
| `animate-bounce-in` | Bouncy scale entrance | 600ms |
| `animate-typing-dot` | Vertical bounce (loop) | 1400ms |
| `transition-smooth` | Transform + opacity | 200ms |
| `transition-colors-smooth` | Color transitions | 200ms |
| `hover-lift` | Lift on hover (-2px) | 200ms |
| `hover-scale` | Scale on hover (1.02x) | 200ms |

---

## Timing Guidelines

```
100ms - Button presses, instant feedback
200ms - Standard transitions, hover effects
300ms - Slide-in animations, fades
400ms - Page sections, larger movements
600ms - Emphasis animations, playful effects
```

---

## DO's and DON'Ts

### ✅ DO

- Use `transform` and `opacity` only
- Keep durations under 600ms
- Respect `prefers-reduced-motion`
- Test on low-powered devices
- Stagger list animations (100ms delay)

### ❌ DON'T

- Animate `width`, `height`, `margin`, `padding`
- Block user interaction with animations
- Use animations on every element
- Chain too many animations
- Forget accessibility

---

## Performance Check

```tsx
// ✅ Good - GPU accelerated
transform: translateX(20px)
opacity: 0

// ❌ Bad - Layout thrashing
margin-left: 20px
width: 100px → 200px
```

---

## Reduced Motion

```tsx
import { usePrefersReducedMotion } from "@/lib/animations";

const reducedMotion = usePrefersReducedMotion();
const animClass = reducedMotion ? "" : "animate-slide-in";
```

---

## Debugging Tips

1. **Slow down animations** (temporarily):
   ```css
   * { animation-duration: 2s !important; }
   ```

2. **Check FPS**: Chrome DevTools → Performance → Record

3. **Layout shifts**: DevTools → Rendering → Layout Shift Regions

4. **Force reduced motion**:
   Chrome DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`

---

## Import from Library

```tsx
import {
  animationPresets,
  getStaggerDelay,
  easings,
  durations,
  usePrefersReducedMotion,
} from "@/lib/animations";

// Use presets
className={animationPresets.messageUser}

// Stagger helper
style={getStaggerDelay(index, 0, 100)}
```

---

**Remember**: Animations should enhance UX, not become the main attraction. Keep them subtle, fast, and purposeful.
