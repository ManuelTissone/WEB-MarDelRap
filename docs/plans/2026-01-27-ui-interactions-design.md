# UI Interactions & Animations Design

## Overview

Four UI enhancements for Mar del Rap's public-facing site: scroll reveal animations, hero parallax, toast notifications, and active section indicator in the navbar. All implemented with vanilla JS (no libraries), respecting the existing design system.

## 1. Scroll Reveal Animations

Animate elements into view as the user scrolls down the page.

### Mechanism

- `IntersectionObserver` with `threshold: 0.15` detects when elements enter viewport
- Elements start hidden via CSS class `.scroll-reveal` (`opacity: 0; transform: translateY(30px)`)
- Observer adds `.revealed` class to trigger transition to final state
- Observer calls `unobserve()` after revealing (animation only fires once)

### Animated Elements

| Element | Effect |
|---------|--------|
| `.section-title` (all sections) | Fade up |
| `.evento-card` | Fade up with stagger (100ms delay between cards) |
| `.galeria-evento` | Fade up with stagger (150ms delay) |
| `.nosotros-texto` | Fade up from left |
| `.nosotros-sponsors` | Fade up from right |
| `.tienda-header` | Fade up |

### CSS

```css
.scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.scroll-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}
```

Stagger delay is applied via inline `transition-delay` in JS when setting up elements.

### Files Modified

- `css/style.css` — Add `.scroll-reveal` and `.revealed` classes
- `js/app.js` — Add `IntersectionObserver` setup and element selection

---

## 2. Hero Parallax

Background image moves at 40% scroll speed; content fades out gradually.

### Mechanism

- `scroll` event listener with early exit if `scrollY > window.innerHeight` (no work after hero is offscreen)
- Desktop only: `window.innerWidth > 768` check prevents execution on mobile (avoids iOS `background-attachment: fixed` issues)
- `requestAnimationFrame` is NOT needed here because the calculations are trivial (two style assignments)

### Effects

| Target | Property | Formula |
|--------|----------|---------|
| `.hero` | `background-position-y` | `scrollY * 0.4` px |
| `.hero-content` | `transform` | `translateY(-scrollY * 0.15px)` |
| `.hero-content` | `opacity` | `1 - (scrollY / viewportHeight) * 0.6` |

### Constraints

- Minimum opacity clamped to 0.4 (content never fully disappears)
- Only processes scroll events when `scrollY < window.innerHeight`
- Disabled on mobile via width check

### Files Modified

- `js/app.js` — Add parallax logic inside existing scroll event listener (merge with navbar background change at line 283)

---

## 3. Toast Notifications

Replace all `alert()` calls with non-intrusive toast notifications.

### Toast API

```js
function showToast(message, type = 'info', duration = 4000)
```

**Types:** `success` (green), `error` (red), `info` (orange/primary)

### Visual Design

- Position: fixed, top-right corner (top: 100px to clear navbar, right: 20px)
- Max width: 350px
- Background: solid color per type with slight transparency
- Text: white, 0.95rem
- Close button (X) on the right
- Progress bar at bottom that shrinks over `duration` ms (CSS animation)
- Slide-in from right on appear, slide-out to right on dismiss
- Max 3 toasts stacked vertically; oldest auto-dismissed when limit exceeded

### Toast Container

A `#toast-container` div is created dynamically on first use and appended to `<body>`.

### Replacements

**app.js:**
- `alert("Debes iniciar sesion para comprar entradas")` -> `showToast("Debes iniciar sesion para comprar entradas", "error")`
- `alert("Proximamente: Compra de entrada...")` -> `showToast("Proximamente: pagos online", "info")`

**auth.js:**
- `alert("Bienvenido de nuevo!")` -> `showToast("Bienvenido de nuevo!", "success")`
- `alert("Cuenta creada exitosamente!")` -> `showToast("Cuenta creada exitosamente!", "success")`

**admin/index.html:**
- All `alert()` calls for informational messages -> `showToast()`
- `confirm()` calls are NOT replaced (they require user response)

### CSS

```css
#toast-container {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  min-width: 280px;
  max-width: 350px;
  padding: 14px 40px 14px 16px;
  border-radius: 8px;
  color: #fff;
  font-size: 0.95rem;
  position: relative;
  animation: toastSlideIn 0.3s ease forwards;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.toast.removing {
  animation: toastSlideOut 0.3s ease forwards;
}

.toast-success { background: #28a745; }
.toast-error { background: #dc3545; }
.toast-info { background: var(--color-primary); }

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0 0 8px 8px;
  animation: toastProgress linear forwards;
}

@keyframes toastSlideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes toastSlideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

@keyframes toastProgress {
  from { width: 100%; }
  to { width: 0%; }
}
```

### Files Modified

- `css/style.css` — Add toast styles
- `js/app.js` — Add `showToast()` function, replace `alert()` calls
- `js/auth.js` — Replace `alert()` calls
- `pages/admin/index.html` — Replace `alert()` calls in inline script

---

## 4. Active Section Indicator in Navbar

Highlight the current section's link in the navbar based on scroll position.

### Mechanism

- `IntersectionObserver` with `threshold: 0.4` monitors each section (`#eventos`, `#tienda`, `#galeria`, `#nosotros`)
- When a section enters viewport at 40%+ visibility, its corresponding navbar link gets `.active-link` class
- Previous active link loses the class
- Uses `rootMargin: '-80px 0px 0px 0px'` to account for fixed navbar height

### CSS

```css
.nav-links a.active-link {
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 4px;
}
```

### Mapping

| Section ID | Nav Link |
|------------|----------|
| `#eventos` | `a[href="#eventos"]` |
| `#tienda` | `a[href="#tienda"]` |
| `#galeria` | `a[href="#galeria"]` |
| `#nosotros` | `a[href="#nosotros"]` |

### Edge Cases

- Hero visible (top of page): no link is active
- Footer visible: `#nosotros` stays active (closest section)
- Mobile hamburger menu: `.active-link` also applies inside the expanded menu

### Files Modified

- `css/style.css` — Add `.active-link` styles
- `js/app.js` — Add section observer

---

## Implementation Order

1. Toast notifications (used by other features for feedback)
2. Scroll reveal animations
3. Active section indicator in navbar
4. Hero parallax

## Files Summary

| File | Changes |
|------|---------|
| `css/style.css` | Add: `.scroll-reveal`, `.revealed`, toast styles, `.active-link` |
| `js/app.js` | Add: `showToast()`, `IntersectionObserver` for reveal + active nav, parallax logic. Replace: `alert()` calls |
| `js/auth.js` | Replace: `alert()` calls with `showToast()` |
| `pages/admin/index.html` | Replace: `alert()` calls with `showToast()` in inline `<script>` |

No new files. No new dependencies. No build changes.
