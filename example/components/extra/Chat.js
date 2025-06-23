
// /frontend-framework/example/components/extra/Chat.js

import { getState, setState, subscribe, unsubscribe } from 'framework/state.js';
import { defineComponent } from 'framework/components.js';
import { createElement, appendChild, setTextContent, clearChildren } from 'framework/dom.js';
import { Config } from 'framework/config.js';

// Chat component factory
export function Chat() {
  // 1) Initialize global state field only once
  if (getState('chatMessages') === undefined) {
    setState('chatMessages', []);
  }
  if (getState('chatStatus') === undefined) {
    setState('chatStatus', 'connecting');
  }

  // 2) Drawing functions
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

  // Function to clear chat history
  function clearChat() {
    setState('chatMessages', []);
  }

  return {
    tag: 'div',
    props: { class: 'chat-page page' },
    children: [
      { tag: 'h2', children: 'Mood & Milestone Tracker' },
      { tag: 'span', props: { id: 'chatStatus' }, children: `Status: ${getState('chatStatus')}` },
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
          { tag: 'input', props: { id: 'chatInput', type: 'text', placeholder: 'Enter message', style: 'flex:1;' } },
          { tag: 'button', props: { id: 'sendBtn' }, children: 'Send' },
          { tag: 'button', props: { id: 'clearBtn' }, children: 'Clear chat' }
        ]
      }
    ],
    lifecycle: {
      mount: (node) => {
        // 1. Create or get existing socket
        let socket = getState('chatSocket');
        if (!socket) {
          socket = io(Config.websocket.apiUrl);
          setState('chatSocket', socket);

          // 2. Set handlers once on first connection
          socket.on('connect', () => setState('chatStatus', 'connected'));
          socket.on('disconnect', () => setState('chatStatus', 'disconnected'));
          socket.on('chat:new-message', (msg) => {
            const arr = getState('chatMessages') || [];
            setState('chatMessages', [...arr, msg]);
          });
        }

        // 3. Subscribe to state-updates
        subscribe('chatMessages', renderMessages);
        subscribe('chatStatus', updateStatusUI);

        // 4. Bind UI handlers
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

          // Save in element, to be able to remove later
          sendBtn._onSend = onSend;
        }

        const clearBtn = node.querySelector('#clearBtn');
        if (clearBtn) {
          clearBtn.addEventListener('click', clearChat);
          clearBtn._onClear = clearChat;
        }

        // 5. Render immediately current data
        renderMessages();
        updateStatusUI();
      },

      update: (node) => {
        // do nothing, because everything is rendered on subscribe
      },

      unmount: (node) => {
        // 6. When unmounting we only remove subscriptions and UI handlers, BUT do not break the socket
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

        // Do not close socket.disconnect() — let it remain connected
      }
    }
  };
}

// Register component
defineComponent('Chat', Chat);
