# Extending the Framework

## Adding New Components
- How to create and register your own component
- Example

## Adding New Routes
- How to add new pages to the SPA
- Example

## Adding New Themes
- How to add and configure custom themes
- Example

## Integration of Modules

The main modules (state, router, events, dom, persistentState) are tightly integrated on pages and in widgets. For example, the Dashboard uses state to store tasks, events for event delegation, dom for rendering, and persistentState for autosaving.

## Dashboard as a Showcase

The Dashboard is a showcase of all features: widgets, routing, themes, global state, and events. You can add/remove widgets, which interact with each other via state and events.

## Example Pages and Routes

| Route           | Description                      |
|-----------------|----------------------------------|
| `/dashboard`    | All widgets                      |
| `/chat`         | Chat only                        |
| `/weather`      | Weather only                     |
| `/task-manager` | Task Manager                     |


## Extensibility

Adding a new widget, page, or event handler is simple:
- Register a component via defineComponent
- Add a route via registerRoute
- Attach an event handler via EventBus or delegateEvent

**Example:**
```js
// Adding a new route
registerRoute('/my-widget', () => {
  renderComponent('MyWidget', {}, document.getElementById('app'));
});
```
