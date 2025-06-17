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
      console.info('PersistentState: Загружено сохраненное состояние.');
    } else {
      console.info('PersistentState: Сохраненное состояние не найдено, используются значения по умолчанию.');
    }
  } catch (err) {
    console.error('PersistentState: Ошибка загрузки состояния из localStorage:', err);
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
    console.info('PersistentState: Состояние сохранено.');
  } catch (err) {
    console.error('PersistentState: Ошибка при сохранении состояния:', err);
  }
}, 300);


//  function initPersistentState() {

//   loadState();

//   try {
//     const stored = localStorage.getItem(STORAGE_KEY);
//     currentState = stored ? JSON.parse(stored) : {};
//   } catch (err) {
//     console.error('PersistentState: Ошибка чтения состояния из localStorage:', err);
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
    console.error('PersistentState: Ошибка чтения состояния из localStorage:', err);
    currentState = {};
  }

  subscribe('*', (change) => {
    // Не сохраняем объекты сокета в persistent state
    if (change.key === 'chatSocket') return;

    currentState[change.key] = change.value;
    saveStateDebounced(currentState);
  });
}



export { initPersistentState };
