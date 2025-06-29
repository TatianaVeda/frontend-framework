# Features & Examples

## Core Framework Features

### Components

The `components.js` module implements a minimal yet powerful declarative component system.  
**Components are fully independent** — they do not depend on routing, theming, or any specific state management.  
You can use them in any context, and connect them to state, router, or theme as needed.

**Key features:**
- Declarative component definition (`defineComponent`)
- Virtual DOM rendering (`renderVNode`)
- Lifecycle hooks (mount, update, unmount)
- Dependency tracking for reactivity

**Example: Core registration logic**  
Source: [components.js:348](../components.js#L348)
```js
export function defineComponent(name, renderFunction) {
  components.set(name, props => {
    const children = props.children || [];
    return renderFunction({ ...props, children });
  });
}
```
**Usage:**
- Components can be rendered anywhere in the app, and can be bound to state or used with any router.

See also: [State Management](#state-management), [Routing](#router)

### Router

The `router.js` module provides a simple but powerful SPA routing system.  
It allows you to register routes, handle navigation, and render components based on the current URL.

**Key features:**
- Registering routes with `registerRoute`
- Dynamic route parameters
- Not found (404) handling
- SPA navigation without page reloads
- Programmatic navigation with `navigateTo`

**Example: Registering a route**  
Source: [main.js:192](../../example/main.js#L74)
```js
registerRoute('/time-tracker', () => {
  const app = document.getElementById('app');
  if (currentComponent?.unmount) currentComponent.unmount();
  renderComponent('TimeTracker', {}, app);
});
```
**Example: Navigating programmatically**  
Source: [router.js:87](../router.js#L87)
```js
export async function navigateTo(path, replace = false) {
  const fullPath = Config.router.basePath + path;
  Logger.debug(`Navigating to route: ${fullPath}`);
  // ...
}
```

See also: [Components](#components), [State Management](#state-management)

### State Management

The `state.js` module provides a simple, reactive global state system for your application.  
It allows you to store, update, and subscribe to state changes anywhere in your app.

**Key features:**
- Global state storage
- Reactive subscriptions with `subscribe`
- Simple API: `getState`, `setState`
- Dependency tracking for efficient updates

**Example: Managing tasks state in a component**  
Source: [queueManager.js:12](../../example/components/queueManager.js#L12), [queueManager.js:16](../../example/components/queueManager.js#L16), [queueManager.js:21](../../example/components/queueManager.js#L21), [queueManager.js:23](../../example/components/queueManager.js#L23), [queueManager.js:155](../../example/components/queueManager.js#L155)
```js
if (!getState('tasks')) setState('tasks', []);
...
const tasks = getState('tasks') || [];
setState('tasks', [...tasks, newTask]);
...
subscribe('tasks', tasksSubscription);
```

See also: [Components](#components), [Persistent State](#persistent-state)

### Persistent State

The `persistentState.js` module enables automatic saving and restoring of global state between sessions.  
It ensures that user data (such as theme, tasks, or chat) is preserved even after a page reload.

**Key features:**
- Automatic state persistence (localStorage)
- Works with any state key (theme, tasks, etc.)
- Simple API: `initPersistentState()`

**Example: Persistent state initialization logic**  
Source: [persistentState.js:42](../persistentState.js#L42)
```js
export function initPersistentState() {
  loadState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    currentState = raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('PersistentState: Error reading state from localStorage:', err);
    currentState = {};
  }

  // Subscribe to all state changes
  subscribe('*', (change) => {
    // Do not save socket objects in persistent state
    if (change.key === 'chatSocket') return;

    currentState[change.key] = change.value;
    saveStateDebounced(currentState); // Save the updated state
  });
}
```

See also: [State Management](#state-management)

### API

The `api.js` module provides helpers for making HTTP requests and working with external APIs.

**Key features:**
- Simple fetch helpers (getData, postData)
- Error handling and logging
- Can be extended for custom endpoints

**Example: Fetching weather data in the Weather Widget**  
[View code (WeatherWidget.js, line 38)](../../example/components/WeatherWidget.js#L38)  

```js
// example/components/WeatherWidget.js, lines 38-55
async function fetchWeatherData(city) {
  const cacheKey = `weather_${city.toLowerCase()}`;
  try {
    // Use the framework API with built-in caching
    const response = await getData(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
      timeout: REQUEST_TIMEOUT,
      cacheKey,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'curl/7.64.1'
      },
      metricsLabel: `weather-${city}`,
      onError: (error) => {
        Logger.error(`Error getting weather for ${city}:`, error);
      }
    });
    // ...
  } catch (error) {
    Logger.error(`Error getting weather for ${city}:`, error);
    throw error;
  }
}
```

### Logger

The `logger.js` module provides a simple logging utility for debugging and error reporting.

**Key features:**
- Info, warn, error logging
- Unified logging interface

**Example: Logging an error during component mount**
[View code (components.js, line 137)](../components.js#L137)
```js
// framework/components.js, line 120
Logger.error('Error in unmount component method:', err);
```

### Config

The `config.js` module centralizes all configuration for the framework and example project.

**Key features:**
- Theme palettes and defaults
- API endpoints
- Component and DOM settings

**Example: Using lazyRenderOptions for DOM rendering**  
[View code (config.js, line 32)](../config.js#L32)  

```js
// framework/config.js, lines 32-37
const Config = {
  dom: {
    lazyRenderOptions: {
      rootMargin: '0px',
      threshold: 0.1
    }
  }
};
```
### DOM Utilities

The `dom.js` module contains helper functions for DOM manipulation and UI updates.

**Key features:**
- Utility functions for working with elements
- Helpers for scrolling, focus, and more

**Example: Auto-scroll chat to the latest message**
[View code (extra/Chat.js, line 21)](../../example/components/extra/Chat.js#L21)
```js
// example/components/extra/Chat.js, lines 34–49
function renderMessages() {
  const messages = getState('chatMessages') || [];
  const container = document.getElementById('messagesContainer');
  if (!container) return;
  clearChildren(container);
  messages.forEach((msg) => {
    // ...
    appendChild(container, p);
  });
  // Auto-scroll to the bottom
  container.scrollTop = container.scrollHeight;
}
```

### Events

The `events.js` module provides a simple event system for custom event handling and delegation.

**Key features:**
- Register and trigger custom events
- Event delegation for components

**Example 1: Event delegation in Task Manager**
[View code (queueManager.js, lines 158)](../../example/components/queueManager.js#L158)
```js
// example/components/queueManager.js, lines 120–180
import { delegateEvent } from 'framework/events.js';

delegateEvent(
  container,
  'click',
  '[data-action="edit"]',
  (e) => {
    const itemId = Number(e.target.closest('[data-id]').dataset.id);
    // ...update task logic
  },
  { namespace: 'task-manager' }
);
```

**Example 2: Custom event handling in EventsDemo**
```js
// example/components/EventsDemo.js, lines 1–77
import { createCustomEvent, dispatchCustomEvent, delegateEvent, EventBus } from 'framework/events.js';

// Listen for globalEvent on the EventBus and log it
EventBus.on('globalEvent', (data) => {
  addLog(`Global event received: ${data}`);
});

// Trigger a global event via the EventBus
EventBus.emit('globalEvent', 'Event from EventBus!');
```

### Lazy Rendering

The `lazyMount.js` module provides a utility for lazy rendering (mounting) of components and images using the IntersectionObserver API.

**Key features:**
- Delays mounting of a component until its container enters the viewport.
- Can be used for images (lazy loading) and any heavy or rarely visible widgets.
- Helps reduce initial load time and memory usage.

**Where used:**
- On the main Dashboard for Weather and Chat widgets.
- For heavy or rarely visited pages (e.g., `/performance`, `/icons`).

**Example: Lazy-mounting a component (from example/main.js, Dashboard route)**
[View code (main.js, line 402)](../../example/main.js#L402)
```js
// example/main.js, lines ~370-380
const weatherPanel = document.getElementById('weather-panel');
weatherPanel.innerHTML = '<div id="weather-widget"></div>';
const weatherWidgetContainer = document.getElementById('weather-widget');
lazyMount(
  weatherWidgetContainer,
  initWeatherWidget,
  Config.dom.lazyRenderOptions
); // Lazy rendering demo
```
---

## Example Project Features
### Theming

The `theme` system enables dynamic switching between light, dark, and custom color palettes using CSS variables.  
It allows users to personalize the look and feel of the application in real time.

**Key features:**
- ThemeSwitcher component for UI theme selection
- Support for light, dark, custom, and auto modes
- CSS variables for all key colors
- Persistent custom palettes

**Example: Switching theme mode and using CSS variables**
```js
// Change theme mode (e.g., to dark)
setState('themeMode', 'dark');

// In CSS:
// background: var(--bg-color);
// color: var(--text-color);
```

See also: [State Management](#state-management), [Persistent State](#persistent-state)

### Integration of Modules

In the project, the main modules (state, router, events, dom, persistentState) work closely together on real pages and widgets.

- **State** stores tasks, messages, theme settings, and more.
- **Events** are used for event delegation (e.g., handling task clicks).
- **DOM** is responsible for rendering and updating the UI.
- **PersistentState** automatically saves important data between sessions.
- **Router** manages navigation between pages and widgets.

**Example:**
The Dashboard uses state to store tasks, events for event delegation, dom for rendering widgets, and persistentState for autosaving tasks and settings.
---

### Dashboard as a Showcase

The Dashboard is a showcase of all framework features: widgets, routing, themes, global state, and events.

- Quick start for new users: see how everything works live.
- List of widgets: Task Manager, Weather, Chat, Time Tracker and Theme switcher.
- Widgets can be added/removed and interact via state and events.
---

### Example Pages and Routes

The project implements demo pages for different widgets and features:
- Time Tracker, Weather, Task Manager, Chat ( File Progress, Form Demo, File Progress, DOM Utils, Events, API, Performance Dashboard)

| Route                 | Description             | Component Path                                 |
|-----------------------|------------------------|------------------------------------------------|
| `/dashboard`          | All widgets            | (composed from all below)                      |
| `/theme-switcher`     | Theme Switcher         | example/components/ThemeSwitcher.js            |
| `/weather`            | Weather Widget         | example/components/WeatherWidget.js            |
| `/time-tracker`       | Time Tracker           | example/components/timeTracker.js              |
| `/chat`               | WebSocket Chat         | example/components/extra/Chat.js               |
| `/task-manager`       | Task Manager           | example/components/queueManager.js             |
| `/api-demo`           | API Demo               | example/components/APIDemo.js                  |
| `/dom-utils-demo`     | DOM Utils Demo         | example/components/DOMUtilsDemo.js             |
| `/events-demo`        | Events Demo            | example/components/EventsDemo.js               |
| `/performance`        | Performance Dashboard  | example/components/performanceDashboard.js     |
| `/form-demo`          | Form Demo              | example/components/FormDemo.js                 |
| `/icon-demo`          | Icons Demo             | example/components/IconDemo.js                 |
| `/file-progress`      | Download Progress      | example/components/extra/FileProgressDemo.js   |







