import { getState, setState, subscribe } from 'framework/state.js';

export function Notifications() {

  if (!getState('notifications')) {
    setState('notifications', []);
  }

  const renderNotifications = () => {
    const notifications = getState('notifications');
    return {
      tag: 'ul',
      children: notifications.map(msg => ({ tag: 'li', children: msg }))
    };
  };

  return {
    tag: 'div',
    props: { class: 'notifications' },
    children: [
      { tag: 'h3', children: 'Уведомления' },
      renderNotifications()
    ],
    lifecycle: {
      update: (node) => {

        const container = node.querySelector('ul');
        const notifications = getState('notifications');
        container.innerHTML = '';
        notifications.forEach(msg => {
          const li = document.createElement('li');
          li.textContent = msg;
          container.appendChild(li);
        });
      }
    }
  };
}
