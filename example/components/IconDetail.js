import { createElement, setTextContent, appendChild, setStyle } from 'framework/dom.js';
import { getState, setState } from 'framework/state.js';
import { delegateEvent, removeDelegateEventsByNamespace } from 'framework/events.js';

export function IconDetail({ key, src, clicks }) {
  const container = createElement('div');

  const img = createElement('img', { src, alt: key });
  setStyle(img, {
    display: 'block',
    margin: '0 auto 16px',
    width: '128px',
    height: '128px'
  });
  appendChild(container, img);

  const stateNames = getState('iconNames') || {};
  const displayName = stateNames[key] || key;
  const namePara = createElement('h3');
  setTextContent(namePara, `Имя: ${displayName}`);
  appendChild(container, namePara);

  const info = createElement('p');
  setTextContent(info, `Иконка была нажата ${clicks} раз.`);
  appendChild(container, info);

  const backBtn = createElement('button');
  setTextContent(backBtn, 'Назад к списку');
  backBtn.dataset.action = 'go-back';

  const resetBtn = createElement('button');
  setTextContent(resetBtn, 'Обнулить счётчик кликов');
  resetBtn.dataset.action = 'reset-count';

  const renameBtn = createElement('button');
  setTextContent(renameBtn, 'Присвоить имя изображению');
  renameBtn.dataset.action = 'rename';

  const btnWrapper = createElement('div');
  setStyle(btnWrapper, { marginTop: '16px', display: 'flex', gap: '8px' });
  appendChild(btnWrapper, backBtn);
  appendChild(btnWrapper, resetBtn);
  appendChild(btnWrapper, renameBtn);
  appendChild(container, btnWrapper);

  return {
    tag: 'div',
    props: { class: 'page icon-detail' },
    children: [container],
    lifecycle: {
      mount: (node) => {
        console.info('IconDetail смонтирован', node);
        const wrapper = node.querySelector('div');

        delegateEvent(
          wrapper,
          'click',
          '[data-action="go-back"]',
          (e) => {
            window.navigateTo('/icons', e);
          }
        );

        delegateEvent(
          wrapper,
          'click',
          '[data-action="reset-count"]',
          (e) => {
            const allClicks = getState('iconClicks') || {};
            allClicks[key] = 0;
            setState('iconClicks', { ...allClicks });

            const infoNode = wrapper.querySelector('p');
            if (infoNode) {
              setTextContent(infoNode, `Иконка была нажата 0 раз.`);
            }
          }
        );

        delegateEvent(
          wrapper,
          'click',
          '[data-action="rename"]',
          (e) => {
            const currentNames = getState('iconNames') || {};
            const newName = prompt('Введите новое имя для изображения:', currentNames[key] || '');
            if (newName != null) {
              const namesState = getState('iconNames') || {};
              namesState[key] = newName;
              setState('iconNames', { ...namesState });

              const nameNode = wrapper.querySelector('h3');
              if (nameNode) {
                setTextContent(nameNode, `Имя: ${newName}`);
              }
            }
          }
        );
      },
      unmount: (node) => {
        console.info('IconDetail размонтирован', node);
        const wrapper = node.querySelector('div');
        if (wrapper) {
          removeDelegateEventsByNamespace(wrapper, '');
        }
      }
    }
  };
}
