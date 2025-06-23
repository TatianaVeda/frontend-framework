// /frontend-framework/example/components/DOMUtilsDemo.js
import {
  createElement,
  appendChild,
  clearChildren,
  setTextContent,
  toggleClass,
  setStyle,
  batchAppendChildren
} from 'framework/dom.js';
import { delegateEvent, removeAllDelegateEvents } from 'framework/events.js';

export function DOMUtilsDemo() {
  const listContainer = createElement('ul', { class: 'dom-list' });
  let updateCount = 0;

  const renderList = () => {
    updateCount++;
    clearChildren(listContainer);
    const items = [];
    const count = Math.floor(Math.random() * 5) + 3;

    for (let i = 1; i <= count; i++) {
      const li = createElement('li');
      setTextContent(li, `Обновление #${updateCount} – Элемент ${i}`);
      li.setAttribute('data-index', i);
      toggleClass(li, 'highlight', i % 2 === 0);

      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
      const randomBg    = '#' + Math.floor(Math.random()*16777215).toString(16);
      setStyle(li, {
        color: randomColor,
        backgroundColor: randomBg,
        padding: '5px',
        margin: '3px 0'
      });

      li.dataset.action = 'click-item';
      items.push(li);
    }

    batchAppendChildren(listContainer, items);

    setTimeout(() => {
      if (items[0]) {
        items[0].removeAttribute('data-index');
        console.info('Удалён data-index у первого элемента');
      }
    }, 2000);
  };

  const updateButton = createElement('button', { id: 'updateListBtn' });
  setTextContent(updateButton, 'Обновить список');
  updateButton.dataset.action = 'update-list';

  renderList();

  return {
    tag: 'div',
    props: { class: 'dom-utils-demo page' },
    children: [
      { tag: 'h2', children: 'Демонстрация расширенных возможностей DOM-утилит' },
      { tag: 'div', props: { id: 'domDemoContainer' }, children: [updateButton, listContainer] }
    ],
    lifecycle: {
      mount(node) {
        console.info('DOMUtilsDemo смонтирован', node);
        const container = node.querySelector('#domDemoContainer');

        delegateEvent(container, 'click', '[data-action="update-list"]', () => {
          renderList();
        });
        delegateEvent(container, 'click', '[data-action="click-item"]', e => {
          console.info(`Клик по элементу с data-index: ${e.target.dataset.index}`);
        });
      },
      // unmount(node) {
      //   console.info('DOMUtilsDemo размонтирован', node);
      //   const container = node.querySelector('#domDemoContainer');
      //   removeAllDelegateEvents(container, 'click');
      // }
      unmount: (node) => {
    if (!node) return;
    console.info('DOMUtilsDemo размонтирован', node);
    const container = node.querySelector('#domDemoContainer');
    if (container) removeAllDelegateEvents(container, 'click');
  }
    }
  };
}
