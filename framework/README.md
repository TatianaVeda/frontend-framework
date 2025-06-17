# dot-js Framework

## Установка
Скопируйте папку `framework` в свой проект.

## Использование
### Рендеринг компонентов
```javascript
import { createElement } from './framework/core.js';

const element = createElement('div', { id: 'app' }, 'Hello, World!');
document.body.appendChild(element);
