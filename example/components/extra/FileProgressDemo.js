import { getData, postData } from 'framework/api.js';
import { getState, setState, subscribe, unsubscribe } from 'framework/state.js';
import { setTextContent } from 'framework/dom.js';
import { defineComponent } from 'framework/components.js';

export function FileProgressDemo() {

  // Initialize downloadProgress state to 0 if undefined
  if (getState('downloadProgress') === undefined) {
    setState('downloadProgress', 0);
  }
  // Initialize uploadProgress state to 0 if undefined
  if (getState('uploadProgress') === undefined) {
    setState('uploadProgress', 0);
  }

  // Update the download progress bar and text
  function updateDownloadBar() {
    const percent = getState('downloadProgress');
    const bar = document.querySelector('#downloadProgressBar .bar');
    const text = document.getElementById('downloadProgressText');
    if (bar) {
      // Adjust the width of the progress bar
      bar.style.width = `${percent}%`;
    }
    if (text) {
      // Update the displayed percentage text
      setTextContent(text, `Downloaded: ${percent}%`);
    }
  }

  // Update the upload progress bar and text
  function updateUploadBar() {
    const percent = getState('uploadProgress');
    const bar = document.querySelector('#uploadProgressBar .bar');
    const text = document.getElementById('uploadProgressText');
    if (bar) {
      // Adjust the width of the progress bar
      bar.style.width = `${percent}%`;
    }
    if (text) {
      // Update the displayed percentage text
      setTextContent(text, `Uploaded: ${percent}%`);
    }
  }

  return {
    tag: 'div',
    props: { class: 'file-progress page' },
    children: [
      // Section header
      { tag: 'h2', children: 'File Transfers with Progress' },

      // Download section
      {
        tag: 'div',
        props: { id: 'downloadSection', style: 'margin-top: 16px;' },
        children: [
          // Button to start download
          { tag: 'button', props: { id: 'downloadBtn' }, children: 'Download Large File' },
          // Progress bar container
          {
            tag: 'div',
            props: {
              id: 'downloadProgressBar',
              style: 'width:100%; height:20px; background:#eee; margin-top:8px; position:relative;'
            },
            children: [
              // Inner bar indicating progress
              {
                tag: 'div',
                props: {
                  class: 'bar',
                  style: 'height:100%; width:0%; background:#4caf50;'
                }
              }
            ]
          },
          // Text showing downloaded percentage
          { tag: 'div', props: { id: 'downloadProgressText', style: 'margin-top:4px;' }, children: 'Downloaded: 0%' }
        ]
      },

      // Upload section with custom file chooser
      {
        tag: 'div',
        props: { id: 'uploadSection', style: 'margin-top: 24px;' },
        children: [
          // Custom file-label wrapping our button and filename span
          {
            tag: 'label',
            props: {
              class: 'custom-file-label',
              style: 'display:flex; align-items:center; gap:8px; cursor:pointer;'
            },
            children: [
              // Our custom button to trigger file dialog
              { tag: 'button', props: { type: 'button', class: 'choose-btn' }, children: 'Choose File' },
              // Span to show chosen filename
              { tag: 'span', props: { class: 'filename' }, children: 'No file chosen' }
            ]
          },
          // Hidden native file input (off-screen)
          {
            tag: 'input',
            props: {
              type: 'file',
              id: 'uploadInput',
              style: 'position:absolute; left:-9999px;'
            }
          },
          // Progress bar container
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
          // Text showing uploaded percentage
          { tag: 'div', props: { id: 'uploadProgressText', style: 'margin-top:4px;' }, children: 'Uploaded: 0%' }
        ]
      }
    ],
    lifecycle: {
      mount: (node) => {
        console.info('FileProgressDemo mounted', node);

        // ------------------------
        // 1) DOWNLOAD BUTTON LOGIC
        // ------------------------
        const downloadBtn = node.querySelector('#downloadBtn');
        if (downloadBtn) {
          downloadBtn.addEventListener('click', () => {
            // Reset progress and start download with progress callback
            setState('downloadProgress', 0);
            getData('/api/big-file', {
              responseType: 'blob',
              progressCb: (loaded, total) => {
                const percent = total ? Math.round((loaded / total) * 100) : 0;
                setState('downloadProgress', percent);
              }
            })
              .then((blob) => {
                // Trigger file download once complete
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'big-image.jpg';
                link.click();
              })
              .catch((err) => {
                console.error('Download error:', err);
              });
          });
        }

        // ---------------------------------
        // 2) CUSTOM FILE-INPUT BUTTON LOGIC
        // ---------------------------------
        const chooseBtn = node.querySelector('.choose-btn');
        const fileInput = node.querySelector('#uploadInput');
        const nameSpan  = node.querySelector('.filename');

        if (chooseBtn && fileInput && nameSpan) {
          // When user clicks our button, open the native file dialog
          chooseBtn.addEventListener('click', () => {
            fileInput.click();
          });

          // When a file is selected, update the filename text and start upload
          fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            // Update span: either chosen filename or fallback text
            nameSpan.textContent = file ? file.name : 'No file chosen';

            if (!file) return;

            // Reset upload progress state
            setState('uploadProgress', 0);

            // Start POST upload with progress callback
            postData('/api/upload', file, {
              transformData: d => d,
              uploadProgressCb: (loaded, total) => {
                const percent = total ? Math.round((loaded / total) * 100) : 0;
                setState('uploadProgress', percent);
              }
            })
              .then((res) => {
                console.info('Upload success:', res);
              })
              .catch((err) => {
                console.error('Upload error:', err);
              });
          });
        }

        // --------------------------------
        // 3) PROGRESS STATE SUBSCRIPTIONS
        // --------------------------------
        subscribe('downloadProgress', updateDownloadBar);
        subscribe('uploadProgress',   updateUploadBar);

        // Perform initial UI update
        updateDownloadBar();
        updateUploadBar();
      },

      update: (node) => {
        // No additional updates needed here
      },

      unmount: (node) => {
        console.info('FileProgressDemo unmounted', node);
        // Clean up subscriptions
        unsubscribe('downloadProgress', updateDownloadBar);
        unsubscribe('uploadProgress',   updateUploadBar);
      }
    }
  };
}

defineComponent('FileProgressDemo', FileProgressDemo);
