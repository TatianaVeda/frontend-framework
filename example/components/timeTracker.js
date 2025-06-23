import { getState, setState, subscribe, unsubscribe } from 'framework/state.js';

export function TimeTracker() {
  // --- Таймер ---
  const startTimer = () => {
    // Очищаем предыдущий интервал, если есть
    const prevInterval = getState('timerInterval');
    if (prevInterval) clearInterval(prevInterval);

    setState('timeElapsed', 0);
    const start = Date.now();
    const interval = setInterval(() => {
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
  };

  const continueTimer = () => {
    if (getState('timerInterval') || getState('timeElapsed') === 0) return;
    const start = Date.now() - getState('timeElapsed') * 1000;
    // Очищаем предыдущий интервал, если есть
    const prevInterval = getState('timerInterval');
    if (prevInterval) clearInterval(prevInterval);
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setState('timeElapsed', elapsed);
    }, 1000);
    setState('timerInterval', interval);
  };

  const timeUpdateHandler = () => {
    const timeDisplay = document.getElementById('timeElapsed');
    if (timeDisplay) {
      timeDisplay.textContent = `Elapsed seconds: ${getState('timeElapsed')}`;
    }
  };

  subscribe('timeElapsed', timeUpdateHandler);

  return {
    tag: 'div',
    props: { class: 'time-tracker page' },
    children: [
      { tag: 'h2', children: 'Time Tracker' },
      { tag: 'p', props: { id: 'timeElapsed' }, children: `Elapsed seconds: ${getState('timeElapsed')}` },
      { tag: 'button', props: { id: 'startButton' }, events: { click: startTimer }, children: 'Start' },
      { tag: 'button', props: { id: 'stopButton' }, events: { click: stopTimer }, children: 'Stop' },
      { tag: 'button', props: { id: 'continueButton' }, events: { click: continueTimer }, children: 'Continue' }
    ],
    lifecycle: {
      mount: (node) => {
        console.info('TimeTracker mounted', node);
        // Инициализация только если значения не заданы
        if (getState('timeElapsed') === undefined) setState('timeElapsed', 0);
        if (getState('timerInterval') === undefined) setState('timerInterval', null);
      },
      update: (node) => {
        const timeDisplay = node.querySelector('#timeElapsed');
        if (timeDisplay) {
          timeDisplay.textContent = `Elapsed seconds: ${getState('timeElapsed')}`;
        }
        const stopButton = node.querySelector('#stopButton');
        const continueButton = node.querySelector('#continueButton');
        if (stopButton) {
          stopButton.disabled = !getState('timerInterval');
        }
        if (continueButton) {
          continueButton.disabled = !!getState('timerInterval') || getState('timeElapsed') === 0;
        }
      },
      unmount: (node) => {
        console.info('TimeTracker unmounted', node);
        // Только отписка, не сбрасываем состояние и не останавливаем таймер
        unsubscribe('timeElapsed', timeUpdateHandler);
      }
    }
  };
}
