# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mar del Rap is a static SPA (Single Page Application) for a hip-hop event organization in Mar del Plata, Argentina. It handles events, galleries, merchandise sales, and user authentication. Built with vanilla HTML/CSS/JS and Firebase as BaaS.

## Development

No build process, no package manager. Open with Live Server (VS Code extension) for local development. The project is purely static files served directly.

**Deployment:** Vercel (auto-deploys on push to main).

## Architecture

- **Frontend:** Vanilla JS (ES6+), no framework or bundler
- **Backend:** Firebase 9.22.0 (Firestore + Auth)
- **Image hosting:** ImgBB API
- **Hosting:** Vercel

### Key Files

| File | Responsibility |
|------|---------------|
| `index.html` | Main landing page with 7 sections (hero, eventos, galeria, tienda, nosotros, contacto, footer) |
| `js/app.js` | Core application logic: event loading, gallery lightbox, shop tabs, navigation |
| `js/auth.js` | Firebase Auth flows (login, register, logout, admin verification) |
| `js/firebase-config.js` | Firebase SDK initialization |
| `css/style.css` | All styles (~1700 lines), responsive design with media queries |
| `pages/admin/index.html` | Admin dashboard: CRUD for events, galleries, sponsors, products |
| `pages/perfil.html` | User profile with ticket history |

### Firestore Collections

- `eventos` — Event listings (titulo, fecha, hora, lugar, precio, disponibles, imagen, activo)
- `galerias` — Photo galleries linked to past events (eventoId, titulo, fotos[])
- `sponsors` — Merchandise brand sponsors (nombre, logo, fondo)
- `productos` — Products linked to sponsors (sponsorId, nombre, precio, stock, imagen, nuevo)
- `usuarios` — User profiles (nombre, email, entradas[])
- `admins` — Admin access control by email

## Design System

**Colors (CSS variables):**
- Primary: `#ff6b00` (orange)
- Secondary: `#1a1a1a` (dark gray)
- Accent: `#ffd700` (gold)

**Responsive breakpoints:**
- Desktop: >1200px
- Tablet: 768px–1199px
- Mobile: <768px

## Important Patterns

- All images go through ImgBB upload (not stored locally)
- Admin access is verified by checking the user's email against the `admins` Firestore collection
- The shop uses a tab system where each sponsor has its own product list and dynamic background image
- Gallery uses an expandable grid with a lightbox modal (keyboard nav: arrows + ESC)
- Navigation uses smooth scroll with a fixed navbar that changes style on scroll
- The project language is Spanish (UI text, variable names in some places, comments)

# Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

## File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the gemini command:

### Examples:

**Single file analysis:**
```bash
gemini -p "@src/main.py Explain this file's purpose and structure"
```

**Multiple files:**
```bash
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"
```

**Entire directory:**
```bash
gemini -p "@src/ Summarize the architecture of this codebase"
```

**Multiple directories:**
```bash
gemini -p "@src/ @tests/ Analyze test coverage for the source code"
```

**Current directory and subdirectories:**
```bash
gemini -p "@./ Give me an overview of this entire project"

# Or use --all_files flag:
gemini --all_files -p "Analyze the project structure and dependencies"
```

## Implementation Verification Examples

**Check if a feature is implemented:**
```bash
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"
```

**Verify authentication implementation:**
```bash
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"
```

**Check for specific patterns:**
```bash
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"
```

**Verify error handling:**
```bash
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"
```

**Check for rate limiting:**
```bash
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"
```

**Verify caching strategy:**
```bash
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"
```

**Check for specific security measures:**
```bash
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"
```

**Verify test coverage for features:**
```bash
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"
```

## When to Use Gemini CLI

Use `gemini -p` when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase

## Important Notes

- Paths in `@` syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for `--yolo` flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results