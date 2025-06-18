import { setState, subscribe } from 'framework/state.js';

const STORAGE_KEY = 'appState';

// Функция загрузки из localStorage
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.info('PersistentState: нет сохранённого state — оставляем defaults.');
      return;
    }

    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([key, value]) => {
      setState(key, value);
    });
    console.info('PersistentState: загружено состояние из localStorage.');
  } catch (err) {
    console.error('PersistentState: не удалось загрузить state:', err);
  }
}

// Простая debounce-обёртка
function debounce(fn, delay) {
  let timeout = null;
  return (arg) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(arg), delay);
  };
}

let currentState = {};

// Основная функция инициализации
export function initPersistentState() {
  // 1) Загружаем (если есть) предыдущий state
  loadState();

  // 2) Читаем его в currentState, или оставляем пустым объектом
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    currentState = raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('PersistentState: ошибка чтения currentState:', err);
    currentState = {};
  }

  const saveDebounced = debounce((stateObj) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateObj));
      console.info('PersistentState: state сохранён.');
    } catch (err) {
      console.error('PersistentState: ошибка при сохранении state:', err);
    }
  }, 300);

  subscribe('*', (change) => {
    // Пропускаем ненужные ключи
    if (change.key === 'chatSocket') return;

    currentState[change.key] = change.value;

    saveDebounced(currentState);
  });
}

