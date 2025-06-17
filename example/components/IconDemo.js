import {
  createElement, appendChild, setStyle, clearChildren
} from 'framework/dom.js';
import { getState, setState, subscribe, unsubscribe } from 'framework/state.js';
import { delegateEvent } from 'framework/events.js';

export function IconDemo() {
  const builtInIcons = [
    { key: 'android192', src: '/android-chrome-192x192.png', alt: 'Android 192×192' },
    { key: 'android512', src: '/android-chrome-512x512.png', alt: 'Android 512×512' },
    { key: 'apple',     src: '/apple-touch-icon.png',    alt: 'Apple Touch' },
    { key: 'fav16',     src: '/favicon-16x16.png',       alt: 'Favicon 16×16' },
    { key: 'fav32',     src: '/favicon-32x32.png',       alt: 'Favicon 32×32' }
  ];


  const clicks = getState('iconClicks') || {};
  builtInIcons.forEach(({ key }) => {
    if (clicks[key] == null) clicks[key] = 0;
  });
  setState('iconClicks', clicks);

  const names = getState('iconNames') || {};
  setState('iconNames', names);

  const uploaded = getState('userIcons') || [];
  setState('userIcons', uploaded);


  const container = createElement('div');
  setStyle(container, {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 120px)',
    gap: '16px',
    padding: '16px'
  });

  function renderIcons() {
    clearChildren(container);

    const stateClicks   = getState('iconClicks');
    const stateNames    = getState('iconNames');
    const stateUploaded = getState('userIcons') || [];


    const allIcons = [
      ...builtInIcons,
      ...stateUploaded
    ];

    allIcons.forEach(({ key, src, alt }) => {

      const wrapper = createElement('div', { 'data-icon-key': key, class: 'icon-wrapper' });

 
      const displayName = stateNames[key] || alt;
      const img = createElement('img', {
        src,
        alt: displayName,
        title: displayName,
        width: '64',
        height: '64'
      });

      const counter = createElement('div');
      counter.textContent = `Кликов: ${stateClicks[key] || 0}`;

      appendChild(wrapper, img);
      appendChild(wrapper, counter);


      const isUploaded = stateUploaded.some(item => item.key === key);
      if (isUploaded) {
        const delBtn = createElement('button', { 
          class: 'delete-upload-btn', 
          'data-action': 'delete-upload',
          'data-icon-key': key 
        });
        setStyle(delBtn, {
          marginTop: '4px',
          background: '#e74c3c',
          color: '#fff',
          border: 'none',
          padding: '4px 6px',
          cursor: 'pointer',
          fontSize: '12px'
        });
        delBtn.textContent = 'Удалить';
        appendChild(wrapper, delBtn);
      }


      appendChild(container, wrapper);
    });
  }

  const update = () => renderIcons();
  subscribe('iconClicks', update);
  subscribe('iconNames',  update);
  subscribe('userIcons',  update);


  let nextUploadId = Date.now();
  function generateUploadKey() {
    return 'upload_' + (nextUploadId++);
  }


  function handleFileUpload(file) {
    const objectURL = URL.createObjectURL(file);
    const newKey = generateUploadKey();
    const newIcon = { key: newKey, src: objectURL, alt: file.name };


    const existing = getState('userIcons') || [];
    setState('userIcons', [...existing, newIcon]);


    const c = getState('iconClicks');
    c[newKey] = 0;
    setState('iconClicks', { ...c });

    const n = getState('iconNames');
    n[newKey] = file.name;
    setState('iconNames', { ...n });
  }

  return {
    tag: 'div',
    props: { class: 'page icon-demo' },
    children: [
      { tag: 'h2', children: 'Иконки с реактивными счётчиками' },
      {
        tag: 'div',
        props: { class: 'uploader', style: 'margin-bottom:16px;' },
        children: [
          { tag: 'label', props: { for: 'fileInput' }, children: 'Загрузить своё изображение: ' },
          { tag: 'input', props: { type: 'file', id: 'fileInput', accept: 'image/*' } }
        ]
      },
      container
    ],
    lifecycle: {
      mount: (node) => {
        console.info('IconDemo смонтирован');
        renderIcons();


        delegateEvent(
          container,
          'click',
          '[data-icon-key]:not([data-action="delete-upload"])',
          (event) => {
    
            const wrapper = event.target.closest('[data-icon-key]');
            const key = wrapper.dataset.iconKey;
    
            const current = getState('iconClicks')[key] || 0;
            setState('iconClicks', { ...getState('iconClicks'), [key]: current + 1 });
            window.navigateTo(`/icons/${key}`, event);
          }
        );

        delegateEvent(
          container,
          'click',
          '[data-action="delete-upload"]',
          (event) => {
            event.stopPropagation(); 

            const keyToDelete = event.target.dataset.iconKey;

            const oldUploads = getState('userIcons') || [];
            const newUploads = oldUploads.filter(item => item.key !== keyToDelete);
            setState('userIcons', newUploads);

            const oldClicks = getState('iconClicks');
            delete oldClicks[keyToDelete];
            setState('iconClicks', { ...oldClicks });

            const oldNames = getState('iconNames');
            delete oldNames[keyToDelete];
            setState('iconNames', { ...oldNames });
          }
        );

        const fileInput = node.querySelector('#fileInput');
        if (fileInput) {
          fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleFileUpload(file);
            e.target.value = '';
          });
        }
      },
      unmount: (node) => {
        unsubscribe('iconClicks', update);
        unsubscribe('iconNames',  update);
        unsubscribe('userIcons',  update);
        console.info('IconDemo размонтирован');
       //removeDelegateEventsByNamespace(container, '')
      }
    }
  };
}
