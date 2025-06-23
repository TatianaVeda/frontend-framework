// /dot-js/frontend/dot-js/example/components/extra/FileProgressDemo.js

import { getData, postData } from 'framework/api.js';
import { getState, setState, subscribe, unsubscribe } from 'framework/state.js';
//import { createElement, appendChild, clearChildren } from 'framework/dom.js';
import {  setTextContent } from 'framework/dom.js';
import { defineComponent } from 'framework/components.js';

export function FileProgressDemo() {
  // Initialize progress in state
  if (getState('downloadProgress') === undefined) {
    setState('downloadProgress', 0);
  }
  if (getState('uploadProgress') === undefined) {
    setState('uploadProgress', 0);
  }

  // Functions to update progress bars
  function updateDownloadBar() {
    const percent = getState('downloadProgress');
    const bar = document.querySelector('#downloadProgressBar .bar');
    const text = document.getElementById('downloadProgressText');
    if (bar) {
      bar.style.width = `${percent}%`;
    }
    if (text) {
      setTextContent(text, `Downloaded: ${percent}%`);
    }
  }

  function updateUploadBar() {
    const percent = getState('uploadProgress');
    const bar = document.querySelector('#uploadProgressBar .bar');
    const text = document.getElementById('uploadProgressText');
    if (bar) {
      bar.style.width = `${percent}%`;
    }
    if (text) {
      setTextContent(text, `Uploaded: ${percent}%`);
    }
  }

  return {
    tag: 'div',
    props: { class: 'file-progress page' },
    children: [
      { tag: 'h2', children: 'File upload with progress' },

      // Download section
      {
        tag: 'div',
        props: { id: 'downloadSection', style: 'margin-top: 16px;' },
        children: [
          { tag: 'button', props: { id: 'downloadBtn' }, children: 'Download big file' },
          {
            tag: 'div',
            props: {
              id: 'downloadProgressBar',
              style: 'width:100%; height:20px; background:#eee; margin-top:8px; position:relative;'
            },
            children: [
              {
                tag: 'div',
                props: {
                  class: 'bar',
                  style: 'height:100%; width:0%; background:#4caf50;'
                }
              }
            ]
          },
          { tag: 'div', props: { id: 'downloadProgressText', style: 'margin-top:4px;' }, children: 'Downloaded: 0%' }
        ]
      },

      // Upload section
      {
        tag: 'div',
        props: { id: 'uploadSection', style: 'margin-top: 24px;' },
        children: [
          {
            tag: 'input',
            props: { type: 'file', id: 'uploadInput', style: 'display:block; margin-bottom:8px;' }
          },
          {
            tag: 'div',
            props: {
              id: 'uploadProgressBar',
              style: 'width:100%; height:20px; background:#eee; margin-top:8px; position:relative;'
            },
            children: [
              {
                tag: 'div',
                props: {
                  class: 'bar',
                  style: 'height:100%; width:0%; background:#2196F3;'
                }
              }
            ]
          },
          { tag: 'div', props: { id: 'uploadProgressText', style: 'margin-top:4px;' }, children: 'Uploaded: 0%' }
        ]
      }
    ],
    lifecycle: {
      mount: (node) => {
        // Download handler
        const downloadBtn = node.querySelector('#downloadBtn');
        if (downloadBtn) {
          downloadBtn.addEventListener('click', () => {
            setState('downloadProgress', 0);
            getData('/api/big-file', {
              responseType: 'blob',
              progressCb: (loaded, total) => {
                const percent = total ? Math.round((loaded / total) * 100) : 0;
                setState('downloadProgress', percent);
              }
            })
              .then((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'big-image.jpg';
                link.click();
              })
              .catch((err) => {
                console.error(err);
              });
          });
        }

        // Upload handler
        const uploadInput = node.querySelector('#uploadInput');
        if (uploadInput) {
          uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            setState('uploadProgress', 0);
            postData('/api/upload', file, {
              transformData: (data) => data, // send as Blob
              uploadProgressCb: (loaded, total) => {
                const percent = total ? Math.round((loaded / total) * 100) : 0;
                setState('uploadProgress', percent);
              }
            })
              .then((res) => {
                console.info('Upload success:', res);
              })
              .catch((err) => {
                console.error(err);
              });
          });
        }

        // Subscribe to progress changes
        subscribe('downloadProgress', updateDownloadBar);
        subscribe('uploadProgress', updateUploadBar);

        // Render initial values
        updateDownloadBar();
        updateUploadBar();
      },

      update: (node) => {
        // Progress bars are updated via subscribe
      },

      unmount: (node) => {
        unsubscribe('downloadProgress', updateDownloadBar);
        unsubscribe('uploadProgress', updateUploadBar);
      }
    }
  };
}

// Register component
defineComponent('FileProgressDemo', FileProgressDemo);
