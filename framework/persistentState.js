// /dot-js/framework/persistentState.js
import { setState, subscribe } from 'framework/state.js';

const STORAGE_KEY = 'appState';

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedState = JSON.parse(stored);

      Object.keys(parsedState).forEach(key => {
        setState(key, parsedState[key]);
      });
      console.info('PersistentState: Loaded saved state.');
    } else {
      console.info('PersistentState: Saved state not found, using default values.');
    }
  } catch (err) {
    console.error('PersistentState: Error loading state from localStorage:', err);
  }
}

function debounce(fn, delay) {
  let timeout;
  return function(arg) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(arg), delay);
  };
}

let currentState = {};


const saveStateDebounced = debounce((state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.info('PersistentState: State saved.');
  } catch (err) {
    console.error('PersistentState: Error saving state:', err);
  }
}, 300);


//  function initPersistentState() {

//   loadState();

//   try {
//     const stored = localStorage.getItem(STORAGE_KEY);
//     currentState = stored ? JSON.parse(stored) : {};
//   } catch (err) {
//     console.error('PersistentState: Error reading state from localStorage:', err);
//     currentState = {};
//   }

//   subscribe('*', (change) => {

//     currentState[change.key] = change.value;
//     saveStateDebounced(currentState);
//   });
// }

function initPersistentState() {
  loadState();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    currentState = stored ? JSON.parse(stored) : {};
  } catch (err) {
    console.error('PersistentState: Error reading state from localStorage:', err);
    currentState = {};
  }

  subscribe('*', (change) => {
    // Do not save socket objects in persistent state
    if (change.key === 'chatSocket') return;

    currentState[change.key] = change.value;
    saveStateDebounced(currentState);
  });
}



export { initPersistentState };
