# Frontend Framework Demo

## Project Overview
This project is a modern, modular frontend framework for rapid SPA (Single Page Application) development with a showcase of real-world widgets and demo pages. 
This is an architectural approach where the entire application works on a single HTML page, and transitions between "pages" are implemented dynamically through JavaScript (without reloading the browser).
It features theme switching, SPA routing, global and persistent state, event delegation, and a set of ready-to-use components.

## Documentation

- [Features & Examples](docs/features.md)
- [Extending the Framework](docs/extending.md)
- [Architecture Details](docs/architecture.md)
- [Best Practices](docs/best-practices.md)

## Architecture (Overview)

```
+------------------+         +------------------+
|   Application    |         |      State       |
+------------------+         +------------------+
        | updates                 ^ subscribes
        v                        |
+------------------+ <-----> +------------------+
|   Components     | updates |     Events       |
+------------------+         +------------------+
        | dispatches                ^ dispatches
        v                        |
+------------------+ <-----> +------------------+
|      DOM         | updates |    HTTP/API      |
+------------------+         +------------------+
        | routing
        v
+------------------+
|     Routing      |
+------------------+
```

**Legend:**
- `updates` — data/state changes flow
- `subscribes` — listens for changes
- `dispatches` — sends events or actions
- `<----->` — bidirectional communication
- `routing` — navigation logic

**Explanation:**
- **Application**: Entry point, initializes and manages the app.
- **Components**: UI blocks, interact with state, events, and DOM.
- **State**: Centralized, reactive data store. Components update and subscribe to it.
- **Events**: Event system for communication between components and modules.
- **DOM**: Direct DOM manipulation and rendering.
- **HTTP/API**: Handles external data requests.
- **Routing**: SPA navigation and URL management.

For a detailed graphical architecture, see [docs/architecture.md](docs/architecture.md).


## Installation
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd frontend-framework
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

##  Getting Started
- **Run the example app locally:**
  ```bash
  npm run starts
  ```
  The app will be available at [http://localhost:3000](http://localhost:3000)

## How to Use
- Explore the demo widgets and pages at the provided routes (see documentation for full list)
- Modify or add components in `example/components/` to extend the demo
- Core framework code is in `framework/` — see `docs/` for API and usage
- Persistent state is enabled by default (see `framework/persistentState.js`)
- Theming, routing, and state management are integrated and ready to use

---
For more details, see the documentation in `framework/docs/` and the code comments in each module.

## Manual testing:  

  - Start the app: `npm run starts`
  - Open [http://localhost:3000](http://localhost:3000)
  - Check all main routes and widgets (Dashboard, Chat, Weather, etc.)
  - Try switching themes, adding/deleting tasks, sending chat messages, etc.
  - Open DevTools console for errors.

## Troubleshooting

- **App doesn't start or port 3000 is busy:**  
  Make sure no other app is running on port 3000. You can change the port in `package.json` or stop the conflicting process.

- **Module not found / dependency errors:**  
  Run `npm install` again to ensure all dependencies are installed.

- **Styles or themes not applied:**  
  Make sure your browser is not caching old CSS. Try hard-refresh (Ctrl+F5).

- **SPA routing doesn't work:**  
  Ensure you are running the app via `npm run starts` (not just opening `index.html` in the browser).

  ## Directory Structure
- `framework/` — Core framework modules (state, router, events, dom, persistentState, etc.)
- `framework/docs/` — Documentation and usage examples
- `example/` — Demo application with real widgets and pages
  - `components/` — All example widgets and demo components
  - `main.js` — Entry point for the example app
  - `index.html` — Main HTML file
  - `styles.css` — Example styles and theming
- `node_modules/` — Project dependencies (auto-installed)
- `.gitignore` — Git ignore rules
- `eslint.config.js` — ESLint configuration
- `favicon.ico` — Favicon for the app
- `jsconfig.json` — JS project config (for IDEs)
- `package.json` — Project metadata and scripts
- `package-lock.json` — Dependency lock file
- `server.js` — Simple server for local development
