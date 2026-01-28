# UI Interactions & Animations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add four UI enhancements to Mar del Rap: toast notifications, scroll reveal animations, active navbar section indicator, and hero parallax.

**Architecture:** All features use vanilla JS with `IntersectionObserver` and native DOM APIs. CSS handles all animations via transitions and keyframes. No libraries, no new files, no build changes.

**Tech Stack:** Vanilla JS (ES6+), CSS3 animations/transitions, IntersectionObserver API

**Design doc:** `docs/plans/2026-01-27-ui-interactions-design.md`

---

### Task 1: Add Toast CSS Styles

**Files:**
- Modify: `css/style.css` (append after line 1232)

**Step 1: Add toast styles at end of style.css**

Append these styles after the `expandFondo` keyframe (line 1232):

```css
/* Toast Notifications */
#toast-container {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
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
  pointer-events: all;
}

.toast.removing {
  animation: toastSlideOut 0.3s ease forwards;
}

.toast-success { background: #28a745; }
.toast-error { background: #dc3545; }
.toast-info { background: var(--color-primary); }

.toast-close {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
}

.toast-close:hover {
  color: #fff;
}

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

@media (max-width: 768px) {
  #toast-container {
    right: 10px;
    left: 10px;
    top: 80px;
  }
  .toast {
    min-width: unset;
    max-width: unset;
    width: 100%;
  }
}
```

**Step 2: Verify in browser**

Open Live Server. No visual changes yet (no toasts exist). Verify no CSS errors in DevTools console.

**Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: add toast notification CSS styles"
```

---

### Task 2: Add showToast() Function to app.js

**Files:**
- Modify: `js/app.js` (insert at top, before line 1 — preloader code)

**Step 1: Add showToast function at the very top of app.js**

Insert before line 1 (before `// Preloader`):

```js
// Toast Notifications
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  // Max 3 toasts — remove oldest if needed
  while (container.children.length >= 3) {
    container.removeChild(container.firstChild);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    ${message}
    <button class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 300);">&times;</button>
    <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

```

**Step 2: Test manually in browser**

Open DevTools console and run:
```js
showToast('Test success', 'success');
showToast('Test error', 'error');
showToast('Test info', 'info');
```

Expected: Three toasts stack in top-right corner with progress bars. Auto-close after 4s.

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add showToast() notification function"
```

---

### Task 3: Replace alert() Calls in app.js

**Files:**
- Modify: `js/app.js:272` and `js/app.js:278`

**Step 1: Replace alert at line 272**

Change:
```js
    alert("Debes iniciar sesión para comprar entradas");
```
To:
```js
    showToast("Debes iniciar sesión para comprar entradas", "error");
```

**Step 2: Replace alert at line 278**

Change:
```js
  alert(`Próximamente: Compra de entrada para evento ${eventoId}`);
```
To:
```js
  showToast("Próximamente: compra de entradas online", "info");
```

**Step 3: Test in browser**

Click "Comprar Entrada" without being logged in — should show red toast. Click while logged in — should show orange info toast. No `alert()` popups should appear.

**Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: replace alert() with showToast() in app.js"
```

---

### Task 4: Replace alert() Calls in auth.js

**Files:**
- Modify: `js/auth.js:66` and `js/auth.js:120`

**Step 1: Replace alert at line 66**

Change:
```js
        alert('¡Bienvenido de nuevo!');
```
To:
```js
        showToast('¡Bienvenido de nuevo!', 'success');
```

**Step 2: Replace alert at line 120**

Change:
```js
        alert('¡Cuenta creada exitosamente!');
```
To:
```js
        showToast('¡Cuenta creada exitosamente!', 'success');
```

**Step 3: Test in browser**

Log in with valid credentials — should see green toast "Bienvenido de nuevo!" instead of alert popup.

**Step 4: Commit**

```bash
git add js/auth.js
git commit -m "feat: replace alert() with showToast() in auth.js"
```

---

### Task 5: Replace alert() Calls in Admin Panel

**Files:**
- Modify: `pages/admin/index.html` — inline `<script>` block

**Step 1: Add showToast script reference**

The admin page loads `../../js/app.js` is NOT loaded by the admin page. The `showToast` function needs to be available. Add this script tag at line 626, after the Firebase scripts and before the inline `<script>`:

```html
<script src="../../js/app.js"></script>
```

Wait — the admin page has its OWN `cargarEventos` and `cargarProductos` functions that conflict with app.js. Instead, copy the `showToast` function directly into the admin page's inline `<script>` block.

Insert the `showToast` function at the very start of the inline `<script>` tag (after line 627 `<script>`):

```js
        // Toast Notifications (inline for admin)
        function showToast(message, type = 'info', duration = 4000) {
          let container = document.getElementById('toast-container');
          if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
          }
          while (container.children.length >= 3) {
            container.removeChild(container.firstChild);
          }
          const toast = document.createElement('div');
          toast.className = `toast toast-${type}`;
          toast.innerHTML = `
            ${message}
            <button class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 300);">&times;</button>
            <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
          `;
          container.appendChild(toast);
          setTimeout(() => {
            if (toast.parentElement) {
              toast.classList.add('removing');
              setTimeout(() => toast.remove(), 300);
            }
          }, duration);
        }
```

**Step 2: Replace all informational alert() calls in admin**

Replace each `alert()` that is NOT inside a `confirm()` check. The following replacements (line numbers are approximate since we added code above):

| Original | Replacement |
|----------|-------------|
| `alert('Debes iniciar sesión');` | `showToast('Debes iniciar sesión', 'error');` |
| `alert('No tienes permisos de administrador');` | `showToast('No tienes permisos de administrador', 'error');` |
| `alert('Error de autenticación');` | `showToast('Error de autenticación', 'error');` |
| `alert('Error al actualizar evento');` | `showToast('Error al actualizar evento', 'error');` |
| `alert('Error al eliminar evento');` | `showToast('Error al eliminar evento', 'error');` |
| `alert('Evento no encontrado');` | `showToast('Evento no encontrado', 'error');` |
| `alert('Error al cargar datos del evento');` | `showToast('Error al cargar datos del evento', 'error');` |
| `alert('Error al eliminar galería');` | `showToast('Error al eliminar galería', 'error');` |
| `alert('Error al eliminar sponsor');` | `showToast('Error al eliminar sponsor', 'error');` |
| `alert('Error al actualizar stock');` | `showToast('Error al actualizar stock', 'error');` |
| `alert('Error al eliminar producto');` | `showToast('Error al eliminar producto', 'error');` |
| `alert('Sponsor no encontrado');` | `showToast('Sponsor no encontrado', 'error');` |
| `alert('Error al cargar datos del sponsor');` | `showToast('Error al cargar datos del sponsor', 'error');` |
| `alert('Producto no encontrado');` | `showToast('Producto no encontrado', 'error');` |
| `alert('Error al editar producto');` | `showToast('Error al editar producto', 'error');` |

**Important:** Do NOT replace `confirm()` calls — those require user response and must stay as native dialogs.

**Step 3: Test in browser**

Navigate to admin panel. Trigger an error condition (e.g., try to delete an event) — should see red toast instead of alert popup. The `confirm()` dialogs should still appear as native browser dialogs.

**Step 4: Commit**

```bash
git add pages/admin/index.html
git commit -m "feat: replace alert() with showToast() in admin panel"
```

---

### Task 6: Add Scroll Reveal CSS

**Files:**
- Modify: `css/style.css` (append after toast styles)

**Step 1: Add scroll reveal styles**

Append after the toast styles:

```css
/* Scroll Reveal */
.scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.scroll-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

.scroll-reveal-left {
  opacity: 0;
  transform: translateX(-30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.scroll-reveal-left.revealed {
  opacity: 1;
  transform: translateX(0);
}

.scroll-reveal-right {
  opacity: 0;
  transform: translateX(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.scroll-reveal-right.revealed {
  opacity: 1;
  transform: translateX(0);
}
```

**Step 2: Commit**

```bash
git add css/style.css
git commit -m "feat: add scroll reveal CSS classes"
```

---

### Task 7: Add Scroll Reveal JS Logic

**Files:**
- Modify: `js/app.js` — inside the `DOMContentLoaded` event listener (line 293)

**Step 1: Add scroll reveal initialization**

Append the following code at the end of `js/app.js` (after the `cerrarLightboxProducto` function, around line 594):

```js
// Scroll Reveal Animations
function initScrollReveal() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  // Section titles
  document.querySelectorAll('.section-title, .section-title-small').forEach(el => {
    el.classList.add('scroll-reveal');
    revealObserver.observe(el);
  });

  // Evento cards (stagger)
  document.querySelectorAll('.evento-card').forEach((el, i) => {
    el.classList.add('scroll-reveal');
    el.style.transitionDelay = `${i * 100}ms`;
    revealObserver.observe(el);
  });

  // Galeria eventos (stagger)
  document.querySelectorAll('.galeria-evento').forEach((el, i) => {
    el.classList.add('scroll-reveal');
    el.style.transitionDelay = `${i * 150}ms`;
    revealObserver.observe(el);
  });

  // Nosotros
  const nosotrosTexto = document.querySelector('.nosotros-texto');
  if (nosotrosTexto) {
    nosotrosTexto.classList.add('scroll-reveal-left');
    revealObserver.observe(nosotrosTexto);
  }

  const nosotrosSponsors = document.querySelector('.nosotros-sponsors');
  if (nosotrosSponsors) {
    nosotrosSponsors.classList.add('scroll-reveal-right');
    revealObserver.observe(nosotrosSponsors);
  }

  // Tienda header
  const tiendaHeader = document.querySelector('.tienda-header');
  if (tiendaHeader) {
    tiendaHeader.classList.add('scroll-reveal');
    revealObserver.observe(tiendaHeader);
  }
}
```

**Step 2: Call initScrollReveal after content loads**

The reveal must run AFTER `cargarEventos()` and `cargarGaleria()` finish, because those functions create the cards dynamically. Modify the `DOMContentLoaded` listener (line 293) to call `initScrollReveal` after the async functions complete:

Change the existing `DOMContentLoaded` block from:
```js
document.addEventListener("DOMContentLoaded", () => {
  cargarEventos();
  cargarGaleria();

  // Actualizar UI si hay usuario logueado
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario) {
    actualizarUIUsuario(usuario);
  }
});
```

To:
```js
document.addEventListener("DOMContentLoaded", async () => {
  await cargarEventos();
  await cargarGaleria();
  initScrollReveal();

  // Actualizar UI si hay usuario logueado
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario) {
    actualizarUIUsuario(usuario);
  }
});
```

**Step 3: Test in browser**

Reload page. Scroll down slowly. Evento cards should fade up with stagger. Galeria items should fade up. Nosotros text should slide in from left, sponsors from right.

**Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: add scroll reveal animations with IntersectionObserver"
```

---

### Task 8: Add Active Navbar Section Indicator

**Files:**
- Modify: `css/style.css` (append after scroll reveal styles)
- Modify: `js/app.js` (append after scroll reveal code)

**Step 1: Add active-link CSS**

Append to `css/style.css`:

```css
/* Active Nav Link */
.nav-links a.active-link {
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 4px;
  transition: color 0.3s, border-bottom-color 0.3s;
}
```

**Step 2: Add section observer JS**

Append to `js/app.js` (after the `initScrollReveal` function):

```js
// Active Section Navbar Indicator
function initActiveNav() {
  const sections = document.querySelectorAll('#eventos, #tienda, #galeria, #nosotros');
  const navLinksAll = document.querySelectorAll('.nav-links a.scroll-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinksAll.forEach(link => {
          link.classList.remove('active-link');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active-link');
          }
        });
      }
    });
  }, {
    threshold: 0.4,
    rootMargin: '-80px 0px 0px 0px'
  });

  sections.forEach(section => navObserver.observe(section));
}
```

**Step 3: Call initActiveNav in DOMContentLoaded**

Add `initActiveNav();` right after `initScrollReveal();` in the DOMContentLoaded handler:

```js
  initScrollReveal();
  initActiveNav();
```

**Step 4: Test in browser**

Scroll through the page. The navbar link for the current visible section should highlight with orange color and underline. When at top (hero), no link should be active.

**Step 5: Commit**

```bash
git add css/style.css js/app.js
git commit -m "feat: add active section indicator in navbar"
```

---

### Task 9: Add Hero Parallax

**Files:**
- Modify: `js/app.js:283-290` (existing scroll listener)

**Step 1: Replace the existing scroll listener**

Replace the scroll listener at lines 283-290:

```js
// Navbar transparente/sólido al hacer scroll
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 100) {
    navbar.style.background = "rgba(26, 26, 26, 0.95)";
  } else {
    navbar.style.background = "var(--color-secondary)";
  }
});
```

With this expanded version that includes parallax:

```js
// Navbar scroll + Hero parallax
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  // Navbar background
  const navbar = document.querySelector(".navbar");
  if (scrollY > 100) {
    navbar.style.background = "rgba(26, 26, 26, 0.95)";
  } else {
    navbar.style.background = "var(--color-secondary)";
  }

  // Hero parallax (desktop only)
  if (window.innerWidth > 768 && scrollY < window.innerHeight) {
    const hero = document.querySelector(".hero");
    const heroContent = document.querySelector(".hero-content");
    hero.style.backgroundPositionY = `${scrollY * 0.4}px`;
    heroContent.style.transform = `translateY(${-scrollY * 0.15}px)`;
    heroContent.style.opacity = Math.max(0.4, 1 - (scrollY / window.innerHeight) * 0.6);
  }
});
```

**Step 2: Test in browser**

Desktop (>768px): Scroll down from the top. The hero background image should scroll slower than the page. The hero text should drift upward and fade slightly. The effect should stop processing once you pass the hero.

Mobile (<768px): Resize to mobile width. Scroll — no parallax should occur, just normal scrolling.

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add hero parallax effect (desktop only)"
```

---

### Task 10: Final Verification

**Step 1: Full page test**

Open the site in Live Server and verify all four features work together:

1. **Toasts:** Open DevTools console, run `showToast('Test', 'success')`. Click "Comprar Entrada" without login — red toast appears.
2. **Scroll reveal:** Reload page, scroll down — cards, gallery, nosotros sections animate in.
3. **Active navbar:** Scroll through sections — navbar links highlight accordingly.
4. **Parallax:** At desktop width, scroll from top — hero background drifts, text fades.

**Step 2: Mobile test**

Open DevTools, toggle device toolbar (mobile view):
- Toasts should be full-width
- Scroll reveal should still work
- Active navbar should work in hamburger menu
- Parallax should NOT activate

**Step 3: Check for console errors**

Open DevTools Console. Reload and scroll through entire page. Should be zero errors.

**Step 4: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "feat: UI interactions complete — toasts, scroll reveal, active nav, parallax"
```
