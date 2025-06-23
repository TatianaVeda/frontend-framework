import { getState, setState, subscribe } from 'framework/state.js';
import { Config } from 'framework/config.js';

const MODE_LABELS = {
  light:  '🌞 Светлая',
  dark:   '🌙 Тёмная',
  custom: '🎨 Пользовательская',
  auto:   '🌓 Авто'
};

export function ThemeSwitcher() {
  const modes = Config.theme.available;
  const changeMode = mode => setState('themeMode', mode);

  let updateUI;

  // Функция, которая раскрашивает все кружки по текущему customTheme
  function updateColorDots() {
    document.querySelectorAll('.color-dot').forEach(dot => {
      const varName = dot.dataset.var;
      dot.style.backgroundColor =
        getState('customTheme')[varName] ||
        Config.theme.vars.light[varName];
    });
  }

  subscribe('themeMode', () => updateUI && updateUI());
  subscribe('customTheme', updateColorDots);

  return {
    tag: 'div',
    props: { class: 'theme-switcher page card' },
    children: [
      { tag: 'h2', children: 'Тема приложения' },
      {
        tag: 'div',
        props: { class: 'theme-buttons flex gap-2' },
        children: modes.map(m => ({
          tag: 'button',
          props: {
            'data-mode': m,
            class: `btn btn-sm ${getState('themeMode') === m ? 'active' : ''}`
          },
          events: { click: () => changeMode(m) },
          children: MODE_LABELS[m]
        }))
      },
      { tag: 'h3', children: 'Кастомная палитра' },
      {
        tag: 'div',
        props: { class: 'custom-palette grid-2cols' },
        children: Object.entries(Config.theme.vars.light).map(([varName, defaultVal]) => ({
          tag: 'div',
          props: { class: 'palette-item flex items-center' },
          children: [
            {
              tag: 'div',
              props: {
                class: 'color-dot',
                'data-var': varName
              },
              lifecycle: {
                mount(node) {
                  // Установить цвет сразу при монтировании
                  node.style.backgroundColor =
                    getState('customTheme')[varName] || defaultVal;
                },
                update(node) {
                  // На всякий случай, если компонент ре-рендерится
                  node.style.backgroundColor =
                    getState('customTheme')[varName] || defaultVal;
                }
              }
            },
            { tag: 'span', children: varName.replace('--', '') },
            {
              tag: 'input',
              props: {
                type: 'color',
                value: getState('customTheme')[varName] || defaultVal
              },
              events: {
                input: e => {
                  const ct = {
                    ...getState('customTheme'),
                    [varName]: e.target.value
                  };
                  setState('customTheme', ct);
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
          // переключаем активную кнопку
          node.querySelectorAll('.theme-buttons button').forEach(btn => {
            btn.classList.toggle(
              'active',
              btn.dataset.mode === getState('themeMode')
            );
          });
          // показываем или скрываем палитру
          node.querySelector('.custom-palette').style.display =
            getState('themeMode') === 'custom' ? 'grid' : 'none';
        };
        updateUI();
        updateColorDots(); // и сразу раскрасить кружки
      },
      unmount() {
        updateUI = null;
      }
    }
  };
}
