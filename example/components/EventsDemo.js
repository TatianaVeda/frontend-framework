import { createCustomEvent, dispatchCustomEvent, delegateEvent, EventBus } from 'framework/events.js';
import { createElement, setTextContent, appendChild } from 'framework/dom.js';


export function EventsDemo() {
  const logContainer = createElement('div', { class: 'event-log' });
  
  const addLog = (msg) => {
    const p = createElement('p');
    setTextContent(p, msg);
    appendChild(logContainer, p);
  };

  const delegatedHandler = (event) => {
    addLog(`Делегированное событие: ${event.detail.message}`);
  };

  const triggerCustomEvent = (event) => {
    dispatchCustomEvent(event.target, 'customEvent', { message: 'Привет от dispatchCustomEvent!' });
  };

  const triggerGlobalEvent = () => {
    EventBus.emit('globalEvent', 'Событие от EventBus!');
  };

  EventBus.on('globalEvent', (data) => {
    addLog(`Глобальное событие получено: ${data}`);
  });

  return {
    tag: 'div',
    props: { class: 'events-demo page', id: 'eventsDemoContainer' },
    children: [
      { tag: 'h2', children: 'Демонстрация работы с событиями' },
      {
        tag: 'button',
        props: { class: 'custom-btn', id: 'triggerCustomEventBtn' },
        events: { click: triggerCustomEvent },
        children: 'Сгенерировать кастомное событие'
      },
      {
        tag: 'button',
        props: { id: 'triggerGlobalEventBtn' },
        events: { click: triggerGlobalEvent },
        children: 'Сгенерировать глобальное событие'
      },
      { tag: 'div', props: { id: 'logContainer' }, children: [logContainer] }
    ],
    lifecycle: {
      mount: (node) => {
        console.info('EventsDemo смонтирован', node);

        delegateEvent(node, 'customEvent', '.custom-btn', delegatedHandler);
      },
      update: (node) => {},
      unmount: (node) => {
        console.info('EventsDemo размонтирован', node);
      }
    }
  };
}
