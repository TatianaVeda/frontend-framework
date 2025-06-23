// // /dot-js/frontend/dot-js/example/components/extra/Chat.js


// import { getState, setState, subscribe, unsubscribe } from 'framework/state.js';
// import { defineComponent } from 'framework/components.js';
// import { createElement, appendChild, setTextContent, clearChildren } from 'framework/dom.js';
// import { Config } from 'framework/config.js';

// export function Chat() {
//   // Инициализация глобального state
//   if (getState('chatMessages') === undefined) {
//     setState('chatMessages', []);
//   }
//   if (getState('chatStatus') === undefined) {
//     setState('chatStatus', 'connecting');
//   }

//   // Функция перерисовки списка сообщений
//   function renderMessages() {
//     const messages = getState('chatMessages') || [];
//     const container = document.getElementById('messagesContainer');
//     if (!container) return;
//     clearChildren(container);
//     messages.forEach((msg) => {
//       const p = createElement('p');
//       p.dataset.userId = msg.id;
//       setTextContent(
//         p,
//         `[${new Date(msg.timestamp).toLocaleTimeString()}] Пользователь: ${msg.text}`
//       );
//       appendChild(container, p);
//     });
//     container.scrollTop = container.scrollHeight;
//   }

//   // Функция обновления индикатора статуса
//   function updateStatusUI() {
//     const status = getState('chatStatus');
//     const statusNode = document.getElementById('chatStatus');
//     if (statusNode) {
//       setTextContent(statusNode, `Статус: ${status}`);
//     }
//   }

//   // Функция очистки истории чата
//   function clearChat() {
//     setState('chatMessages', []);
//   }

//   return {
//     tag: 'div',
//     props: { class: 'chat-page page' },
//     children: [
//       { tag: 'h2', children: 'WebSocket-чат' },
//       { tag: 'span', props: { id: 'chatStatus' }, children: `Статус: ${getState('chatStatus')}` },
//       {
//         tag: 'div',
//         props: {
//           id: 'messagesContainer',
//           style: 'overflow-y:auto; height:300px; border:1px solid #ccc; padding:8px; margin-top:8px;'
//         },
//         children: []
//       },
//       {
//         tag: 'div',
//         props: { style: 'margin-top:8px; display:flex; gap:8px;' },
//         children: [
//           { tag: 'input', props: { id: 'chatInput', type: 'text', placeholder: 'Введите сообщение', style: 'flex:1;' } },
//           { tag: 'button', props: { id: 'sendBtn' }, children: 'Отправить' },
//           { tag: 'button', props: { id: 'clearBtn' }, children: 'Очистить чат' }
//         ]
//       }
//     ],
//     lifecycle: {
//       mount: (node) => {
//         // Используем глобальный io(), подключаемся к серверу
//         const socket = io(Config.websocket.apiUrl);
//         setState('chatSocket', socket);

//         // Обработка событий сокета
//         socket.on('connect', () => setState('chatStatus', 'connected'));
//         socket.on('disconnect', () => setState('chatStatus', 'disconnected'));
//         socket.on('chat:new-message', (msg) => {
//           const arr = getState('chatMessages') || [];
//           setState('chatMessages', [...arr, msg]);
//         });

//         // Отправка сообщения при клике на кнопку
//         const sendBtn = node.querySelector('#sendBtn');
//         const chatInput = node.querySelector('#chatInput');
//         if (sendBtn && chatInput) {
//           sendBtn.addEventListener('click', () => {
//             const text = chatInput.value.trim();
//             if (text) {
//               socket.emit('chat:message', text);
//               chatInput.value = '';
//             }
//           });
//         }

//         // Очистка чата при клике на кнопку
//         const clearBtn = node.querySelector('#clearBtn');
//         if (clearBtn) {
//           clearBtn.addEventListener('click', clearChat);
//         }

//         // Подписываемся на изменения в state
//         subscribe('chatMessages', renderMessages);
//         subscribe('chatStatus', updateStatusUI);

//         // Рендерим текущее содержимое сразу после mount
//         renderMessages();
//         updateStatusUI();
//       },

//       update: (node) => {
//         // Здесь нет необходимости писать код, потому что renderMessages() и updateStatusUI()
//         // вызываются через subscribe()
//       },

//       unmount: (node) => {
//         const socket = getState('chatSocket');
//         if (socket) {
//           socket.disconnect();
//         }
//         unsubscribe('chatMessages', renderMessages);
//         unsubscribe('chatStatus', updateStatusUI);
//       }
//     }
//   };
// }

// // Регистрируем компонент в фреймворке
// defineComponent('Chat', Chat);


// /dot-js/frontend/dot-js/example/components/extra/Chat.js

import { getState, setState, subscribe, unsubscribe } from 'framework/state.js';
import { defineComponent } from 'framework/components.js';
import { createElement, appendChild, setTextContent, clearChildren } from 'framework/dom.js';
import { Config } from 'framework/config.js';

// Фабрика компонента Chat
export function Chat() {
  // 1) Инициализируем глобальный state-поле только один раз
  if (getState('chatMessages') === undefined) {
    setState('chatMessages', []);
  }
  if (getState('chatStatus') === undefined) {
    setState('chatStatus', 'connecting');
  }

  // 2) Функции отрисовки
  function renderMessages() {
    const messages = getState('chatMessages') || [];
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    clearChildren(container);
    messages.forEach((msg) => {
      const p = createElement('p');
      p.dataset.userId = msg.id;
      const date = new Date(msg.timestamp);
      const dateStr = date.toLocaleDateString('en-GB');
      const timeStr = date.toLocaleTimeString();
      setTextContent(
        p,
        `[${dateStr} ${timeStr}] User notes: ${msg.text}`
      );
      appendChild(container, p);
    });
    container.scrollTop = container.scrollHeight;
  }

  function updateStatusUI() {
    const status = getState('chatStatus');
    const statusNode = document.getElementById('chatStatus');
    if (statusNode) {
      setTextContent(statusNode, `Статус: ${status}`);
    }
  }

  // Функция очистки истории чата
  function clearChat() {
    setState('chatMessages', []);
  }

  return {
    tag: 'div',
    props: { class: 'chat-page page' },
    children: [
      { tag: 'h2', children: 'Mood & Milestone Tracker' },
      { tag: 'span', props: { id: 'chatStatus' }, children: `Статус: ${getState('chatStatus')}` },
      {
        tag: 'div',
        props: {
          id: 'messagesContainer',
          style: 'overflow-y:auto; height:300px; border:1px solid #ccc; padding:8px; margin-top:8px;'
        },
        children: []
      },
      {
        tag: 'div',
        props: { style: 'margin-top:8px; display:flex; gap:8px;' },
        children: [
          { tag: 'input', props: { id: 'chatInput', type: 'text', placeholder: 'Введите сообщение', style: 'flex:1;' } },
          { tag: 'button', props: { id: 'sendBtn' }, children: 'Отправить' },
          { tag: 'button', props: { id: 'clearBtn' }, children: 'Очистить чат' }
        ]
      }
    ],
    lifecycle: {
      mount: (node) => {
        // 1. Создаём или берём существующий сокет
        let socket = getState('chatSocket');
        if (!socket) {
          socket = io(Config.websocket.apiUrl);
          setState('chatSocket', socket);

          // 2. Устанавливаем обработчики один раз при первом подключении
          socket.on('connect', () => setState('chatStatus', 'connected'));
          socket.on('disconnect', () => setState('chatStatus', 'disconnected'));
          socket.on('chat:new-message', (msg) => {
            const arr = getState('chatMessages') || [];
            setState('chatMessages', [...arr, msg]);
          });
        }

        // 3. Подписываемся на state-обновления
        subscribe('chatMessages', renderMessages);
        subscribe('chatStatus', updateStatusUI);

        // 4. Привязываем UI-обработчики
        const sendBtn = node.querySelector('#sendBtn');
        const chatInput = node.querySelector('#chatInput');
        if (sendBtn && chatInput) {
          const onSend = () => {
            const text = chatInput.value.trim();
            if (text) {
              socket.emit('chat:message', text);
              chatInput.value = '';
            }
          };
          sendBtn.addEventListener('click', onSend);

          // Сохраним в элементе, чтобы потом снять
          sendBtn._onSend = onSend;
        }

        const clearBtn = node.querySelector('#clearBtn');
        if (clearBtn) {
          clearBtn.addEventListener('click', clearChat);
          clearBtn._onClear = clearChat;
        }

        // 5. Рендерим сразу текущие данные
        renderMessages();
        updateStatusUI();
      },

      update: (node) => {
        // ничего не делаем, т. к. всё рендерится на subscribe-х
      },

      unmount: (node) => {
        // 6. При unmount мы только снимаем подписки и обработчики UI, НО не разрываем сокет
        unsubscribe('chatMessages', renderMessages);
        unsubscribe('chatStatus', updateStatusUI);

        const sendBtn = node.querySelector('#sendBtn');
        if (sendBtn && sendBtn._onSend) {
          sendBtn.removeEventListener('click', sendBtn._onSend);
          delete sendBtn._onSend;
        }

        const clearBtn = node.querySelector('#clearBtn');
        if (clearBtn && clearBtn._onClear) {
          clearBtn.removeEventListener('click', clearBtn._onClear);
          delete clearBtn._onClear;
        }

        // НЕ закрываем socket.disconnect() — пусть остаётся подключённым     
      }
    }
  };
}

// Регистрируем компонент
defineComponent('Chat', Chat);
