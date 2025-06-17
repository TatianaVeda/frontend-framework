
import { getData } from 'framework/api.js';
import { createElement, setTextContent, appendChild, clearChildren } from 'framework/dom.js';

export function APIDemo() {
  const resultContainer = createElement('div', { class: 'api-result' });

  const fetchData = async () => {
    clearChildren(resultContainer);
    setTextContent(resultContainer, 'Загрузка данных...');

    try {
      const data = await getData('/api/proxy-todo');
      clearChildren(resultContainer);
      const pre = createElement('pre');
      setTextContent(pre, JSON.stringify(data, null, 2));
      appendChild(resultContainer, pre);
    } catch (err) {
      clearChildren(resultContainer);
      setTextContent(resultContainer, 'Ошибка при получении данных.');
      console.error('APIDemo fetchData error:', err);
    }
  };

  return {
    tag: 'div',
    props: { class: 'api-demo page' },
    children: [
      { tag: 'h2', children: 'Демонстрация API-запросов' },
      {
        tag: 'button',
        props: { id: 'fetchButton' },
        events: { click: fetchData },
        children: 'Выполнить GET-запрос'
      },
      { tag: 'div', props: { id: 'resultContainer' }, children: [resultContainer] }
    ],
    lifecycle: {
      mount: (node) => {
        console.info('APIDemo смонтирован', node);
      },
      update: (node) => {},
      unmount: (node) => {
        console.info('APIDemo размонтирован', node);
      }
    }
  };
}
