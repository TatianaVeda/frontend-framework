import {
  createElement, appendChild, setStyle, clearChildren
} from 'framework/dom.js';
import { getState, setState, subscribe, unsubscribe } from 'framework/state.js';
import { delegateEvent } from 'framework/events.js';

export function IconDemo() {
  // Define built-in icons with keys, source paths, and alt text
  const builtInIcons = [
    { key: 'android192', src: '/android-chrome-192x192.png', alt: 'Android 192×192' },
    { key: 'android512', src: '/android-chrome-512x512.png', alt: 'Android 512×512' },
    { key: 'apple',     src: '/apple-touch-icon.png',    alt: 'Apple Touch' },
    { key: 'fav16',     src: '/favicon-16x16.png',       alt: 'Favicon 16×16' },
    { key: 'fav32',     src: '/favicon-32x32.png',       alt: 'Favicon 32×32' }
  ];

  // Initialize click counts in state if not already present
  const clicks = getState('iconClicks') || {};
  builtInIcons.forEach(({ key }) => {
    if (clicks[key] == null) clicks[key] = 0;
  });
  setState('iconClicks', clicks);

  // Initialize icon names state (empty object if none)
  const names = getState('iconNames') || {};
  setState('iconNames', names);

  // Initialize user-uploaded icons state (empty array if none)
  const uploaded = getState('userIcons') || [];
  setState('userIcons', uploaded);

  // Create the main container element with grid styling
  const container = createElement('div');
  setStyle(container, {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 120px)',
    gap: '16px',
    padding: '16px'
  });

  // Function to render all icons (built-in + uploaded) into the container
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
      // Create a wrapper for each icon
      const wrapper = createElement('div', {
        'data-icon-key': key,
        class: 'icon-wrapper'
      });

      // Determine display name (custom or default alt text)
      const displayName = stateNames[key] || alt;
      const img = createElement('img', {
        src,
        alt: displayName,
        title: displayName,
        width: '64',
        height: '64'
      });

      // Show the click count below the image
      const counter = createElement('div');
      counter.textContent = `Clicks: ${stateClicks[key] || 0}`;
      counter.textContent = `Clicks: ${stateClicks[key] || 0}`;

      appendChild(wrapper, img);
      appendChild(wrapper, counter);

      // If this icon was uploaded by the user, add a delete button
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
        delBtn.textContent = 'Delete';
        delBtn.textContent = 'Delete';
        appendChild(wrapper, delBtn);
      }

      appendChild(container, wrapper);
    });
  }

  // Subscribe to state changes to re-render icons when data updates
  const update = () => renderIcons();
  subscribe('iconClicks', update);
  subscribe('iconNames',  update);
  subscribe('userIcons',  update);

  // Utility to generate unique keys for uploaded icons
  let nextUploadId = Date.now();
  function generateUploadKey() {
    return 'upload_' + (nextUploadId++);
  }

  // Handle file uploads: read as data URL and add to state
  function handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const newKey  = generateUploadKey();
      const newIcon = { key: newKey, src: dataUrl, alt: file.name };

      const existing = getState('userIcons') || [];
      setState('userIcons', [...existing, newIcon]);
      setState('iconClicks', { ...getState('iconClicks'), [newKey]: 0 });
      setState('iconNames',  { ...getState('iconNames'),  [newKey]: file.name });
    };
    reader.readAsDataURL(file);
  }

  return {
    tag: 'div',
    props: { class: 'page icon-demo' },
    children: [
      // Header for the icon demo page
      { tag: 'h2', children: 'Icons with Reactive Counters' },
      // File uploader UI for custom icons
      {
        tag: 'div',
        props: { class: 'uploader', style: 'margin-bottom:16px;' },
        children: [
           { tag: 'label', props: { for: 'fileInput' }, children: 'Upload your own image: ' },
          
          {
  tag: 'label',
  props: { class: 'custom-upload-label', style: 'cursor:pointer; color:#3498db;' },
  children: [
    'Upload Image',
    {
      tag: 'input',
      props: {
        type: 'file',
        id: 'fileInput',
        accept: 'image/*',
        style: 'display:none'
      }
    }
  ]
}

        ]
      },
      // The dynamically rendered icon grid container
      container
    ],
    lifecycle: {
      mount: (node) => {
        console.info('IconDemo mounted');
        console.info('IconDemo mounted');
        renderIcons();

        // Delegate click on any icon (except delete) to increment count and navigate
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

        // Delegate click on delete button to remove uploaded icon and its data
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

        // Attach file input change handler for uploading images
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
        // Unsubscribe from all state updates on unmount
        unsubscribe('iconClicks', update);
        unsubscribe('iconNames',  update);
        unsubscribe('userIcons',  update);
        console.info('IconDemo unmounted');
        // If needed, remove delegated events:
        // removeDelegateEventsByNamespace(container, 'icon-demo');
      }
    }
  };
}
