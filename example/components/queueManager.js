import { VirtualList } from 'framework/components.js';
import { getState, setState, subscribe, unsubscribe } from 'framework/state.js';
import { delegateEvent, removeDelegateEventsByNamespace } from 'framework/events.js';

let isFirstMount = true;

export function QueueManager() {
  // On first mount, initialize the queue state to an empty array
  if (isFirstMount) {
    setState('queue', []);
    isFirstMount = false;
  } else {
    // If not first mount but state is somehow missing, re-initialize
    if (!getState('queue')) {
      setState('queue', []);
    }
  }

  // Add a new item to the queue with incremental ID and default text
  const addItem = () => {
    const queue = getState('queue') || [];
    const newItem = {
      id: queue.length + 1,
      text: `Item ${queue.length + 1}`,
      isEditing: false
    };
    setState('queue', [...queue, newItem]);
  };

  // Update an existing item by ID, applying given changes and turning off edit mode for others
  const updateItem = (id, changes) => {
    const queue = getState('queue') || [];
    const updatedQueue = queue.map(item =>
      item.id === id
        ? { ...item, ...changes }
        : { ...item, isEditing: false }
    );
    setState('queue', updatedQueue);
  };

  // Delete an item by ID, then re-index IDs sequentially
  const deleteItem = (id) => {
    let queue = getState('queue') || [];
    queue = queue.filter(item => item.id !== id);
    queue = queue.map((item, index) => ({
      ...item,
      id: index + 1
    }));
    setState('queue', queue);
  };

  // Render the virtualized queue inside the given container element
  const renderVirtualQueue = (container) => {
    const oldVirtual = container.querySelector('.virtual-list-container');
    const prevScrollTop = oldVirtual ? oldVirtual.scrollTop : 0;

    container.innerHTML = '';

    const virtualQueue = VirtualList({
      items: getState('queue'),
      renderItem: (item, index) => {
        // Create item container
        const containerEl = document.createElement('div');
        containerEl.className = 'queue-item';
        containerEl.dataset.id = item.id;

        // Display item number
        const numberEl = document.createElement('span');
        numberEl.textContent = `${index + 1}. `;
        containerEl.appendChild(numberEl);

        // Text input for item text, enabled only in edit mode
        const input = document.createElement('input');
        input.type = 'text';
        input.value = item.text;
        input.disabled = !item.isEditing;
        input.dataset.action = 'blur';
        containerEl.appendChild(input);

        // Save button
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.dataset.action = 'save';
        containerEl.appendChild(saveButton);

        // Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.dataset.action = 'edit';
        containerEl.appendChild(editButton);

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete Item';
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

    // Restore previous scroll position
    virtualQueue.scrollTop = prevScrollTop;
  };

  let queueSubscription = null;

  return {
    tag: 'div',
    props: { class: 'queue-manager page' },
    children: [
      // Header for queue manager
      { tag: 'h2', children: 'Queue Management' },
      // Button to add a new queue item
      { tag: 'button', events: { click: addItem }, children: 'Add Item' },
      // Container where the virtual queue will be rendered
      { tag: 'div', props: { id: 'queue-container' }, children: [] }
    ],
    lifecycle: {
      mount: (node) => {
        const container = node.querySelector('#queue-container');
        if (!container) {
          console.error('QueueManager.mount: Container #queue-container not found.');
          return;
        }

        // Initial render
        renderVirtualQueue(container);

        // Subscribe to queue state changes to re-render
        queueSubscription = () => {
          renderVirtualQueue(container);
        };
        subscribe('queue', queueSubscription);

        // Delegate click on Save buttons
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
        // Delegate click on Edit buttons
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
        // Delegate click on Delete buttons
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
        // Delegate blur on inputs to save edits
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
          console.warn('QueueManager.update: Container #queue-container not found.');
          return;
        }
        // Re-render on update
        renderVirtualQueue(container);
      },

      unmount: (node) => {
        console.info('QueueManager unmounted', node);
        if (!node) return;
        // Unsubscribe from state changes
        if (queueSubscription) {
          unsubscribe('queue', queueSubscription);
          queueSubscription = null;
        }
        // Remove delegated event listeners
        const container = node.querySelector('#queue-container');
        if (container) {
          removeDelegateEventsByNamespace(container, 'queue-manager');
        }
      }
    }
  };
}
