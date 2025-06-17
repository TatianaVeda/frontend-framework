import { postData } from 'framework/api.js';
import {
  createElement,
  setTextContent,
  appendChild,
  clearChildren
} from 'framework/dom.js';
import { delegateEvent } from 'framework/events.js';

export function FormDemo() {
  const isLive = window.location.protocol === 'http:' &&
                 window.location.hostname === 'localhost';
  const realPost = postData;
  const mockPost = async (url, body) => {
    await new Promise(r => setTimeout(r, 500));
    return { greeting: `Мок: Привет, ${body.name}!` };
  };
  const send = isLive ? mockPost : realPost;

  const container = createElement('div');
  const input = createElement('input', {
        type: 'text',
        name: 'userName',
        id: 'userNameInput',
        placeholder: 'Ваше имя'
      });

  const btn = createElement('button');
  setTextContent(btn, 'Отправить');
  btn.dataset.action = 'submit-form';

  const result = createElement('p');

  appendChild(container, input);
  appendChild(container, btn);
  appendChild(container, result);

  return {
    tag: 'div',
    props: { class: 'form-demo page' },
    children: [container],
    lifecycle: {
      mount: (node) => {
        console.info('FormDemo смонтирован', node);
        const formContainer = node.querySelector('div');
        delegateEvent(formContainer, 'click', '[data-action="submit-form"]', async () => {
          const name = input.value.trim();
          if (!name) {
            result.textContent = 'Введите имя';
            return;
          }
          clearChildren(result);
          setTextContent(result, 'Отправляем...');
          try {
            const res = await send('/hello', { name });
            clearChildren(result);
            setTextContent(result, `Сервер ответил: ${res.greeting}`);
          } catch (err) {
            clearChildren(result);
            setTextContent(result, 'Ошибка при отправке');
            console.error(err);
          }
        });
      },
      update: (node) => {
      },
      unmount: (node) => {
        console.info('FormDemo размонтирован', node);
   
         removeAllDelegateEvents(node.querySelector('div'), 'click');
      }
    }
  };
}
