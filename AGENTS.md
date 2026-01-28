# AGENTS.md

Instructions for AI coding agents working on this repository.

## Project Overview

**Mar del Rap** is a static single-page application (SPA) for a hip-hop event organization based in Mar del Plata, Argentina. The app manages events, photo galleries, merchandise sales, and user authentication.

- **Stack:** Vanilla HTML/CSS/JS (ES6+), no framework or bundler
- **Backend:** Firebase 9.22.0 (Firestore database + Firebase Auth)
- **Image hosting:** ImgBB API (images are never stored locally)
- **Hosting:** Vercel (auto-deploys on push to `main`)
- **Language:** Spanish (all UI text, most comments, some variable names)

## Repository Structure

```
mardelrap-web/
├── index.html                 # Main landing page (7 sections)
├── css/style.css              # All styles (~1700 lines), responsive
├── js/
│   ├── app.js                 # Core logic: events, gallery, shop, nav
│   ├── auth.js                # Firebase Auth flows (login, register, logout)
│   └── firebase-config.js     # Firebase SDK initialization
├── pages/
│   ├── perfil.html            # User profile with ticket history
│   └── admin/index.html       # Admin dashboard (CRUD for all entities)
└── assets/
    └── images/                # Local logos and static assets
```

## Build and Test Commands

There is **no build process, no package manager, no test runner**. The project is purely static files.

- **Local dev:** Open the project folder in VS Code and use the Live Server extension
- **No `npm install`** or equivalent is needed
- **No automated tests exist** — verify changes manually in the browser

## Firestore Collections

| Collection  | Fields                                                             |
|-------------|--------------------------------------------------------------------|
| `eventos`   | titulo, fecha, hora, lugar, precio, disponibles, imagen, activo    |
| `galerias`  | eventoId, titulo, fotos[]                                          |
| `sponsors`  | nombre, logo, fondo                                                |
| `productos` | sponsorId, nombre, precio, stock, imagen, nuevo                    |
| `usuarios`  | nombre, email, entradas[]                                          |
| `admins`    | email-based access control                                         |

## Code Style Guidelines

### General

- No TypeScript, no JSX, no modules — everything is vanilla ES6+ loaded via `<script>` tags
- Use `const`/`let` (never `var`)
- Functions use both traditional `function` declarations and arrow functions — follow the style already present in the file you are editing
- CSS uses custom properties (variables) defined in `:root` — always use the existing variables instead of hardcoding colors

### CSS Variables (Design System)

```css
--color-primary: #ff6b00;    /* Orange */
--color-secondary: #1a1a1a;  /* Dark gray */
--color-accent: #ffd700;     /* Gold */
```

### Responsive Breakpoints

- Desktop: >1200px
- Tablet: 768px–1199px
- Mobile: <768px

All CSS media queries follow mobile-first or desktop-first patterns already established in `style.css`. Match the existing approach.

### Naming

- HTML IDs and classes use kebab-case (`event-card`, `gallery-grid`)
- JS variables and functions use camelCase (`loadEventos`, `sponsorId`)
- Firestore field names are in Spanish (`titulo`, `fecha`, `precio`)

## Important Patterns

- **Image uploads** always go through the ImgBB API — never store user-uploaded images in the repo
- **Admin access** is determined by checking the user's email against the `admins` Firestore collection — there is no role field on user documents
- **Shop tabs** — each sponsor gets its own tab with a unique product list and dynamic background image
- **Gallery lightbox** — expandable grid with a modal that supports keyboard navigation (arrow keys + ESC)
- **Navbar** — fixed position, changes style on scroll, uses smooth scroll for anchor links
- **Firebase SDK** is loaded from CDN via `<script>` tags, not via npm

## Security Considerations

- **Firebase config** is in `js/firebase-config.js` — this contains client-side keys that are safe to commit, but Firestore security rules (managed in Firebase Console) are the real access control
- **Never commit** server-side secrets, API keys with write access, or `.env` files
- **Admin verification** happens client-side by querying the `admins` collection — the actual security enforcement must be in Firestore rules
- **ImgBB API key** is used client-side for image uploads — treat it as a public key
- **Input sanitization** — always sanitize user inputs before writing to Firestore or rendering in the DOM to prevent XSS

## Commit Message Guidelines

- Write commit messages in English
- Use imperative mood in the subject line (e.g., "Add gallery lightbox", "Fix navbar scroll behavior")
- Keep the subject under 72 characters
- Reference the section or feature affected (e.g., "tienda:", "galeria:", "admin:")

## Deployment

- Push to `main` triggers automatic deployment on Vercel
- No build step is configured — Vercel serves the static files directly
- Test changes locally with Live Server before pushing

## Things to Avoid

- Do not add a build system, bundler, or package manager unless explicitly requested
- Do not convert the project to a framework (React, Vue, etc.) unless explicitly requested
- Do not restructure the single-file CSS into multiple files unless explicitly requested
- Do not add TypeScript unless explicitly requested
- Do not store images in the repository — use ImgBB for any new image assets
