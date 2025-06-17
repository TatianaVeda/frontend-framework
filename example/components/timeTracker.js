import { getState, setState, subscribe, unsubscribe } from 'framework/state.js';

export function TimeTracker() {
  setState('timeElapsed', 0);
  setState('timerInterval', null);

  let interval = null;

  const startTimer = () => {
    stopTimer();
    setState('timeElapsed', 0);
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
  };

  const continueTimer = () => {
    if (getState('timerInterval') || getState('timeElapsed') === 0) return;
    const start = Date.now() - getState('timeElapsed') * 1000;
    interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setState('timeElapsed', elapsed);
    }, 1000);
    setState('timerInterval', interval);
  };

  const timeUpdateHandler = () => {
    const timeDisplay = document.getElementById('timeElapsed');
    if (timeDisplay) {
      timeDisplay.textContent = `Прошло секунд: ${getState('timeElapsed')}`;
    }
  };

  subscribe('timeElapsed', timeUpdateHandler);

  return {
    tag: 'div',
    props: { class: 'time-tracker page' },
    children: [
      { tag: 'h2', children: 'Трекер времени' },
      { tag: 'p', props: { id: 'timeElapsed' }, children: `Прошло секунд: ${getState('timeElapsed')}` },
      { tag: 'button', props: { id: 'startButton' }, events: { click: startTimer }, children: 'Старт' },
      { tag: 'button', props: { id: 'stopButton' }, events: { click: stopTimer }, children: 'Стоп' },
      { tag: 'button', props: { id: 'continueButton' }, events: { click: continueTimer }, children: 'Продолжить' }
    ],
    lifecycle: {
      mount: (node) => {
        console.info('TimeTracker смонтирован', node);
        setState('timeElapsed', 0);
        setState('timerInterval', null);
      },
      update: (node) => {
        const timeDisplay = node.querySelector('#timeElapsed');
        if (timeDisplay) {
          timeDisplay.textContent = `Прошло секунд: ${getState('timeElapsed')}`;
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
        console.info('TimeTracker размонтирован', node);
        stopTimer(); 
        unsubscribe('timeElapsed', timeUpdateHandler);
      }
    }
  };
}
