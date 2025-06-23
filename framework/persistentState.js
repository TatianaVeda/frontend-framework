import { setState, subscribe } from 'framework/state.js';

const STORAGE_KEY = 'appState';

// Loads state from localStorage, if available
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.info('PersistentState: no saved state — keeping defaults.');
      return;
    }

    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([key, value]) => {
      setState(key, value); // Restore each saved state value
    });
    console.info('PersistentState: state loaded from localStorage.');
  } catch (err) {
    console.error('PersistentState: failed to load state:', err);
  }
}

// Utility function to debounce calls — delays execution
function debounce(fn, delay) {
  let timeout = null;
  return (arg) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(arg), delay);
  };
}

let currentState = {};

// Initializes the persistent state mechanism
export function initPersistentState() {
  loadState(); // Load state from storage on init

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    currentState = raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('PersistentState: error reading currentState:', err);
    currentState = {};
  }

  // Debounced save function to prevent frequent writes
  const saveDebounced = debounce((stateObj) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateObj));
      console.info('PersistentState: state saved.');
    } catch (err) {
      console.error('PersistentState: error saving state:', err);
    }
  }, 300);

  // Subscribe to all state changes
  subscribe('*', (change) => {
    if (change.key === 'chatSocket') return; // Skip saving this key

    currentState[change.key] = change.value;

    saveDebounced(currentState); // Save the updated state
  });
}
