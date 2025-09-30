# Architecture

## Framework Directory Structure

- api.js — API helpers
- components.js — Component system
- config.js — Centralized configuration
- dom.js — DOM utilities
- events.js — Event system
- logger.js — Logging utilities
- persistentState.js — Persistent state
- router.js — SPA router
- state.js — Global state
- utils/request.js — HTTP requests and helpers

## Example Project Structure

- components/ — Example widgets and pages
- index.html — Entry point
- main.js — App bootstrap and routing
- public/ — Static assets
- styles.css — Main styles

## Design Principles
- Modularity: Each feature is a separate module.
- Extensibility: Easy to add new widgets, pages, or features.
- Simplicity: Minimal, clear API and structure.

## Architecture Diagram

> **Note:** The App and Framework blocks are of equal height and placed side by side for clarity.

```mermaid
graph TD
  subgraph Framework
    PersistentState
    State
    Events
    API
    Logger
    Config
    Router
    %% 
    Events --- API
    Logger --- Config
  end

  subgraph App
    ThemeSwitcher
    CSSVars
    Styles
    Pages
  end

  PersistentState --> State
  ThemeSwitcher --> State
  State --> CSSVars
  CSSVars --> Pages
  Styles --> Pages
  State --> Pages
  Events --> Pages
  API --> Pages
  Logger --> Pages
  Config --> Pages
  Router --> Pages
  Router --> State
  Router -.-> API
```

## Module Responsibilities
- **PersistentState:** Saves and restores global state between sessions (localStorage).
- **State:** Centralized, reactive global state for all app data.
- **Events:** Event system for delegation and global communication.
- **API:** Helpers for HTTP requests and external APIs.
- **Logger:** Unified logging for debugging and error reporting.
- **Config:** Centralized configuration (themes, endpoints, options).
- **Router:** SPA routing, navigation, and dynamic page rendering.
- **ThemeSwitcher:** UI for changing themes, updates state and CSSVars.
- **CSSVars:** CSS variables for theming, updated from state.
- **Styles:** Global and page-specific styles.
- **Pages:** All app pages (Dashboard, Chat, Weather, etc.), each can use widgets and framework modules.

## How App Uses Framework Modules
- **Pages** and their widgets use State, Events, API, Logger, Config, and Router for all business logic and UI updates.
- **ThemeSwitcher** updates State, which updates CSSVars and thus the app's appearance.
- **PersistentState** ensures important state is saved/restored automatically.
- **Styles** and **CSSVars** provide both global and per-page theming.

## Data Flow Example
1. **User input:** User interacts with a widget (e.g., submits a form).
2. **Event:** Event is handled via Events or the component's event handler.
3. **Processing:** Data is processed, possibly using API or updating State.
4. **State update:** State is updated via setState.
5. **UI update:** Pages/components subscribed to state changes re-render automatically.
6. **Persistence:** If needed, PersistentState saves the new state.

## Data Flow Example: Chat Widget

A real-world example of how data flows through the framework using the Chat widget.

```mermaid
sequenceDiagram
  participant User
  participant ChatInput as "Chat Input"
  participant State as "State"
  participant PersistentState as "PersistentState"
  participant ChatWidget as "Chat Widget"
  participant DOM
  participant EventBus

  User->>ChatInput: Types message and presses Enter
  ChatInput->>EventBus: dispatchCustomEvent('sendMessage', {text})
  EventBus->>ChatWidget: Handles 'sendMessage' event
  ChatWidget->>State: setState('chatMessages', [...])
  State->>PersistentState: (auto) saves chatMessages
  State->>ChatWidget: Triggers subscription on chatMessages
  ChatWidget->>DOM: Rerenders message list
  DOM->>User: Displays new message
```

**Step-by-step:**
1. **User** types a message and presses Enter in the chat input.
2. **Chat Input** dispatches a custom event (`sendMessage`) via the EventBus.
3. **Chat Widget** listens for this event, adds the message to global state (`setState('chatMessages', ...)`).
4. **State** updates, and **PersistentState** automatically saves the new messages.
5. **Chat Widget** is subscribed to `chatMessages` and rerenders the DOM when state changes.
6. **User** sees the new message in the chat window.

**Where implemented:**
- `example/components/extra/Chat.js` — input handling, event dispatch, state subscription, rendering.
- `framework/state.js`, `framework/persistentState.js` — state storage and autosave.
- `framework/events.js` — EventBus and custom events.

 