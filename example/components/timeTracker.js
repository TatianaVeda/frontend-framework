import { getState, setState, subscribe, unsubscribe } from 'framework/state.js';

export function TimeTracker() {
  // Инициализируем стейт
  setState('timeElapsed', 0);
  setState('timerInterval', null);

  const MAX_SECONDS = 3600; // полная шкала — 1 час (можно менять)

  let interval = null;

  // Функция, которая обновляет SVG и цифровой дисплей
  function updateVisual(secs) {
    const circle = document.getElementById('timerCircle');
    const text   = document.getElementById('timerText');
    if (!circle || !text) return;

    // Формат MM:SS
    const mins = String(Math.floor(secs / 60)).padStart(2, '0');
    const sec  = String(secs % 60).padStart(2, '0');
    text.textContent = `${mins}:${sec}`;

    // Процент заполнения круга
    const pct = Math.min(secs, MAX_SECONDS) / MAX_SECONDS;
    const offset = 283 * (1 - pct);
    circle.style.strokeDashoffset = offset;
  }

  // Обработчики кнопок
  const startTimer = () => {
    stopTimer();
    setState('timeElapsed', 0);

    // Пульсация круга чтобы подчеркнуть старт
    const circle = document.getElementById('timerCircle');
    circle && circle.classList.add('pulse');

    const start = Date.now();
    interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setState('timeElapsed', elapsed);
    }, 1000);
    setState('timerInterval', interval);
  };

  const stopTimer = () => {
    const currentInterval = getState('timerInterval');
    if (currentInterval) {
      clearInterval(currentInterval);
      setState('timerInterval', null);
    }
    // Останавливаем пульсацию
    const circle = document.getElementById('timerCircle');
    circle && circle.classList.remove('pulse');
  };

  const continueTimer = () => {
    if (getState('timerInterval') || getState('timeElapsed') === 0) return;

    // Возобновляем без скидывания
    const start = Date.now() - getState('timeElapsed') * 1000;
    interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setState('timeElapsed', elapsed);
    }, 1000);
    setState('timerInterval', interval);

    // Пульс при возобновлении
    const circle = document.getElementById('timerCircle');
    circle && circle.classList.add('pulse');
  };

  // Подписываемся на обновления времени
  const timeUpdateHandler = () => {
    const secs = getState('timeElapsed');
    updateVisual(secs);
  };
  subscribe('timeElapsed', timeUpdateHandler);

  return {
    tag: 'div',
    props: { class: 'time-tracker page' },
    children: [
      { tag: 'h2', children: 'Трекер времени' },
      {
        tag: 'div',
        props: { class: 'timer-visual' },
        children: [
          {
            tag: 'svg',
            props: { width: 200, height: 200, viewBox: '0 0 100 100' },
            children: [
              { tag: 'circle', props: { cx: 50, cy: 50, r: 45, class: 'timer-bg' } },
              { tag: 'circle', props: { cx: 50, cy: 50, r: 45, class: 'timer-fg', className: 'timer-fg', id: 'timerCircle' } },
              { tag: 'text', props: { x: 50, y: 55, 'text-anchor': 'middle', class: 'timer-text', id: 'timerText' }, children: '00:00' }
            ]
          }
        ]
      },
      { tag: 'button', props: { id: 'startButton' }, events: { click: startTimer }, children: 'Старт' },
      { tag: 'button', props: { id: 'stopButton' }, events: { click: stopTimer }, children: 'Стоп' },
      { tag: 'button', props: { id: 'continueButton' }, events: { click: continueTimer }, children: 'Продолжить' }
    ],
    lifecycle: {
      mount: (node) => {
        console.info('TimeTracker смонтирован', node);
        setState('timeElapsed', 0);
        setState('timerInterval', null);
        updateVisual(0);
      },
      update: (node) => {
        // Обновляем кнопки
        const stopBtn = node.querySelector('#stopButton');
        const contBtn = node.querySelector('#continueButton');
        if (stopBtn) stopBtn.disabled = !getState('timerInterval');
        if (contBtn) contBtn.disabled = !!getState('timerInterval') || getState('timeElapsed') === 0;
      },
      unmount: (node) => {
        console.info('TimeTracker размонтирован', node);
        stopTimer();
        unsubscribe('timeElapsed', timeUpdateHandler);
      }
    }
  };
}
