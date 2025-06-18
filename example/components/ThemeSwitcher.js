
//import { defineComponent } from 'framework/components.js';
import { getState, setState, subscribe } from 'framework/state.js';
import { Config } from 'framework/config.js';

function ThemeSwitcher() {
  const modes = Config.theme.available;

  const changeMode = (mode) => {
    setState('themeMode', mode);
  };

  // слежение за UI (например, выделение активной кнопки)
  let updateUI = null;
  subscribe('themeMode', () => {
    if (updateUI) updateUI();
  });

  return {
    tag: 'div',
    props: { class: 'page theme-switcher' },
    children: [
      { tag: 'h2', children: 'Выбор темы' },
      {
        tag: 'div',
        props: { class: 'theme-buttons' },
        children: modes.map(m => ({
          tag: 'button',
          props: {
            'data-mode': m,
            class: getState('themeMode') === m ? 'active' : ''
          },
          events: {
            click: () => changeMode(m)
          },
          children: m.charAt(0).toUpperCase() + m.slice(1)
        }))
      },
      { tag: 'h3', children: 'Кастомные цвета' },
      {
        tag: 'div',
        props: { class: 'custom-palette' },
        children: Object.keys(Config.theme.vars.light).map(varName => ({
          tag: 'div',
          props: { class: 'palette-item' },
          children: [
            { tag: 'label', props: { for: varName }, children: varName },
            {
              tag: 'input',
              props: {
                id: varName,
                type: 'color',
                value: getState('customTheme')[varName] || Config.theme.vars.light[varName]
              },
              events: {
                input: (e) => {
                  const ct = getState('customTheme') || {};
                  ct[varName] = e.target.value;
                  setState('customTheme', { ...ct });
                  setState('themeMode', 'custom');
                }
              }
            }
          ]
        }))
      }
    ],
    lifecycle: {
      mount(node) {
        updateUI = () => {
          const mode = getState('themeMode');
          node.querySelectorAll('.theme-buttons button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
          });
        };
        updateUI();
      },
      unmount() {
        updateUI = null;
      }
    }
  };
}

export { ThemeSwitcher };