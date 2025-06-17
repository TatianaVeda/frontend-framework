import { VirtualList } from 'framework/components.js';
import { getState, setState, subscribe, unsubscribe } from 'framework/state.js';
import { delegateEvent, removeDelegateEventsByNamespace } from 'framework/events.js';

let isFirstMount = true; 

export function QueueManager() {
  if (isFirstMount) {
    setState('queue', []);
    isFirstMount = false;
  } else {
    if (!getState('queue')) {
      setState('queue', []);
    }
  }

  const addItem = () => {
    const queue = getState('queue') || [];
    const newItem = { id: queue.length + 1, text: `Элемент ${queue.length + 1}`, isEditing: false };
    setState('queue', [...queue, newItem]);
  };

  const updateItem = (id, changes) => {
    const queue = getState('queue') || [];
    const updatedQueue = queue.map(item =>
      item.id === id ? { ...item, ...changes } : { ...item, isEditing: false }
    );
    setState('queue', updatedQueue);
  };

  const deleteItem = (id) => {
    let queue = getState('queue') || [];
    queue = queue.filter(item => item.id !== id);
    queue = queue.map((item, index) => ({ ...item, id: index + 1 }));
    setState('queue', queue);
  };

  const renderVirtualQueue = (container) => {
    const oldVirtual = container.querySelector('.virtual-list-container');
    const prevScrollTop = oldVirtual ? oldVirtual.scrollTop : 0;

    container.innerHTML = '';

    const virtualQueue = VirtualList({
      items: getState('queue'),
      renderItem: (item, index) => {
        const containerEl = document.createElement('div');
        containerEl.className = 'queue-item';
        containerEl.dataset.id = item.id;

        const numberEl = document.createElement('span');
        numberEl.textContent = `${index + 1}. `;
        containerEl.appendChild(numberEl);

        const input = document.createElement('input');
        input.type = 'text';
        input.value = item.text;
        input.disabled = !item.isEditing;
        input.dataset.action = 'blur';
        containerEl.appendChild(input);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Сохранить';
        saveButton.dataset.action = 'save';
        containerEl.appendChild(saveButton);

        const editButton = document.createElement('button');
        editButton.textContent = 'Изменить';
        editButton.dataset.action = 'edit';
        containerEl.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить элемент';
        deleteButton.dataset.action = 'delete';
        containerEl.appendChild(deleteButton);

        return containerEl;
      },
      itemHeight: 60,
      containerHeight: 250,
      buffer: 2
    });

    virtualQueue.classList.add('virtual-list-container');
    container.appendChild(virtualQueue);

    virtualQueue.scrollTop = prevScrollTop;
  };

  let queueSubscription = null;

  return {
    tag: 'div',
    props: { class: 'queue-manager page' },
    children: [
      { tag: 'h2', children: 'Управление очередью' },
      { tag: 'button', events: { click: addItem }, children: 'Добавить элемент' },
      { tag: 'div', props: { id: 'queue-container' }, children: [] }
    ],
    lifecycle: {
      mount: (node) => {
        const container = node.querySelector('#queue-container');
        if (!container) {
          console.error('QueueManager.mount: Контейнер #queue-container не найден.');
          return;
        }

        renderVirtualQueue(container);

        queueSubscription = () => {
          renderVirtualQueue(container);
        };
        subscribe('queue', queueSubscription);

        delegateEvent(
          container,
          'click',
          '[data-action="save"]',
          (e) => {
            const itemId = Number(e.target.closest('[data-id]').dataset.id);
            const input = e.target.closest('[data-id]').querySelector('input');
            updateItem(itemId, { text: input.value, isEditing: false });
          },
          { namespace: 'queue-manager' }
        );
        delegateEvent(
          container,
          'click',
          '[data-action="edit"]',
          (e) => {
            const itemId = Number(e.target.closest('[data-id]').dataset.id);
            const queue = getState('queue') || [];
            const updatedQueue = queue.map(el => ({
              ...el,
              isEditing: el.id === itemId
            }));
            setState('queue', updatedQueue);
          },
          { namespace: 'queue-manager' }
        );
        delegateEvent(
          container,
          'click',
          '[data-action="delete"]',
          (e) => {
            const itemId = Number(e.target.closest('[data-id]').dataset.id);
            deleteItem(itemId);
          },
          { namespace: 'queue-manager' }
        );
        delegateEvent(
          container,
          'blur',
          'input[data-action="blur"]',
          (e) => {
            const itemId = Number(e.target.closest('[data-id]').dataset.id);
            const input = e.target;
            updateItem(itemId, { text: input.value, isEditing: false });
          },
          { namespace: 'queue-manager', capture: true }
        );
      },

      update: (node) => {
        const container = node.querySelector('#queue-container');
        if (!container) {
          console.warn('QueueManager.update: Контейнер #queue-container не найден.');
          return;
        }
        renderVirtualQueue(container);
      
      },

      unmount: (node) => {
        console.info('QueueManager размонтирован', node);
        if (queueSubscription) {
          unsubscribe('queue', queueSubscription);
          queueSubscription = null;
        }
        const container = node.querySelector('#queue-container');
        if (container) {
          removeDelegateEventsByNamespace(container, 'queue-manager');
        }
      }
    }
  };
}
