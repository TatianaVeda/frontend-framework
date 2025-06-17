// example/components/WeatherWidget.js
import { defineComponent, renderComponent, bindComponentToStateWithDeps } from 'framework/components.js';
import { setState, getState, subscribe, unsubscribe } from 'framework/state.js';
import { getData } from 'framework/api.js';
import { delegateEvent, removeDelegateEventsByNamespace } from 'framework/events.js';
import { clearChildren, setTextContent } from 'framework/dom.js';
import Logger from 'framework/logger.js';

// Популярные города для быстрого выбора (на разных языках)
const POPULAR_CITIES = [
  'London', 'New York', '東京 (Tokyo)', 'Москва', 'Paris', 'Berlin', 'Rome', 'Madrid',
  'Amsterdam', '北京 (Beijing)', 'Sydney', 'Toronto', 'Санкт-Петербург', 'Київ (Kiev)'
];

// Карта кодов погоды wttr.in в эмодзи
const WEATHER_ICONS = {
  '113': '☀️', '116': '⛅', '119': '☁️', '122': '☁️',
  '143': '🌫️', '176': '🌦️', '179': '🌨️', '182': '🌨️',
  '185': '🌧️', '200': '⛈️', '227': '❄️', '230': '❄️',
  '248': '🌫️', '260': '🌫️', '263': '🌦️', '266': '🌦️',
  '281': '🌧️', '284': '🌧️', '293': '🌦️', '296': '🌧️',
  '299': '🌧️', '302': '🌧️', '305': '🌧️', '308': '🌧️',
  '311': '🌧️', '314': '🌧️', '317': '🌨️', '320': '🌨️',
  '323': '❄️', '326': '❄️', '329': '❄️', '332': '❄️',
  '335': '❄️', '338': '❄️', '350': '🌨️', '353': '🌦️',
  '356': '🌧️', '359': '🌧️', '362': '🌨️', '365': '🌨️',
  '368': '❄️', '371': '❄️', '374': '🌨️', '377': '🌨️',
  '386': '⛈️', '389': '⛈️', '392': '⛈️', '395': '⛈️'
};

const DEFAULT_WEATHER_ICON = '🌤️';

// Настройки виджета
const CACHE_TIMEOUT = 10 * 60 * 1000; // 10 минут
const REQUEST_TIMEOUT = 5000; // 5 секунд

// Функция для получения данных о погоде через API фреймворка с кешированием
async function fetchWeatherData(city) {
  const cacheKey = `weather_${city.toLowerCase()}`;
  
  try {
    // Используем API фреймворка с встроенным кешированием
    const response = await getData(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
      timeout: REQUEST_TIMEOUT,
      cacheKey,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'curl/7.64.1'
      },
      metricsLabel: `weather-${city}`,
      onError: (error) => {
        Logger.error(`Ошибка при получении погоды для ${city}:`, error);
      }
    });

    Logger.debug('Получены данные погоды:', response);
    
    if (response.current_condition && response.current_condition[0]) {
      const current = response.current_condition[0];
      
      return {
        city: city,
        temp: Math.round(current.temp_C),
        weather: current.weatherDesc[0].value,
        icon: WEATHER_ICONS[current.weatherCode] || DEFAULT_WEATHER_ICON,
        source: 'wttr.in'
      };
    } else {
      throw new Error('Неполные данные от API');
    }
  } catch (error) {
    Logger.error(`Ошибка при получении погоды для ${city}:`, error);
    throw error;
  }
}

// Компонент погоды с оптимизированным рендерингом
defineComponent('weather-widget', () => {
  const currentWeather = getState('weather.current');
  const loading = getState('weather.loading');
  
  Logger.debug('Рендер weather-widget. loading:', loading, 'currentWeather:', !!currentWeather);
  
  // Определяем содержимое для отображения погоды
  let weatherContent;
  
  if (loading) {
    weatherContent = {
      tag: 'div',
      props: { class: 'weather-display loading' },
      children: ['🌀 Загрузка погоды...']
    };
  } else if (currentWeather) {
    weatherContent = {
      tag: 'div',
      props: { class: 'weather-display' },
      children: [
        {
          tag: 'div',
          props: { class: 'weather-icon' },
          children: [currentWeather.icon || '🌤️']
        },
        { tag: 'h2', children: [currentWeather.city] },
        { tag: 'div', props: { class: 'temperature' }, children: [`${currentWeather.temp}°C`] },
        { 
          tag: 'div', 
          props: { class: 'condition' }, 
          children: [
            currentWeather.weather,
            currentWeather.source === 'wttr.in' ? ' 🌐' : ''
          ] 
        }
      ]
    };
  } else {
    weatherContent = {
      tag: 'div',
      props: { class: 'weather-display' },
      children: ['Введите название города для просмотра погоды']
    };
  }

  // Контейнер для всего виджета
  return {
    tag: 'div',
    props: { 
      class: `weather-widget${loading ? ' loading' : ''}`,
      'data-component': 'weather-widget'
    },
    children: [
      { tag: 'h1', children: ['🌤️ Weather Widget'] },
      {
        tag: 'div',
        props: { class: 'city-input-section' },
        children: [
          { tag: 'label', children: ['Введите название города:'] },
          {
            tag: 'div',
            props: { class: 'input-group' },
            children: [
              {
                tag: 'input',
                props: { 
                  type: 'text',
                  class: 'city-input',
                  placeholder: 'Например: Москва, London, 東京...',
                  'data-action': 'city-input'
                }
              },
              {
                tag: 'button',
                props: { 
                  class: 'search-btn',
                  type: 'button',
                  'data-action': 'search-weather'
                },
                children: [loading ? '🔄' : '🔍']
              }
            ]
          }
        ]
      },
      {
        tag: 'div',
        props: { class: 'popular-cities' },
        children: [
          { tag: 'p', children: ['Популярные города:'] },
          {
            tag: 'div',
            props: { class: 'city-buttons' },
            children: POPULAR_CITIES.map(city => ({
              tag: 'button',
              props: { 
                class: 'city-btn',
                type: 'button',
                'data-action': 'select-city',
                'data-city': city
              },
              children: [city]
            }))
          }
        ]
      },
      // Добавляем содержимое погоды как единый блок
      weatherContent
    ]
  };
});

// Функция для сохранения истории запросов (используем persistentState)
function saveToHistory(city, weatherData) {
  const history = getState('weather.history') || [];
  const newEntry = {
    city,
    timestamp: Date.now(),
    weather: weatherData
  };
  
  // Сохраняем только последние 10 запросов
  const updatedHistory = [newEntry, ...history.slice(0, 9)];
  setState('weather.history', updatedHistory);
  Logger.debug('Сохранен в историю:', city);
}

// Функция загрузки погоды
async function loadWeather(city) {
  if (getState('weather.loading')) {
    Logger.debug('Запрос погоды уже выполняется, пропускаем');
    return;
  }

  Logger.debug('Начинаем загрузку погоды для:', city);
  setState('weather.loading', true);
  
  try {
    const weatherData = await fetchWeatherData(city);
    Logger.debug('Получили данные:', weatherData);
    setState('weather.current', weatherData);
    
    // Сохраняем в историю при успешном запросе
    saveToHistory(city, weatherData);
  } catch (error) {
    Logger.error('Ошибка загрузки погоды:', error);
    const errorData = {
      city: city,
      temp: '--',
      weather: 'Не удалось загрузить данные. Проверьте название города.',
      icon: '❌',
      source: 'error'
    };
    console.log('Устанавливаем данные об ошибке:', errorData);
    setState('weather.current', errorData);
  } finally {
    setState('weather.loading', false);
    console.log('Установили loading: false. Финальное состояние:', getState('weather'));
  }
}

// Экспорт функции для получения истории
export function getWeatherHistory() {
  return getState('weather.history') || [];
}

// Инициализация виджета с использованием событийной системы фреймворка
export function initWeatherWidget() {
  Logger.info('Инициализация погодного виджета...');
  
  // Инициализируем состояние
  setState('weather', {
    current: null,
    loading: false,
    history: []
  });

  const element = document.getElementById('weather-widget');
  if (!element) {
    Logger.error('Элемент #weather-widget не найден');
    return;
  }

  let isRendering = false; // Флаг для предотвращения множественных рендеров
  let lastRenderState = null; // Для отслеживания изменений состояния
  
  // ПРИНУДИТЕЛЬНАЯ ПОЛНАЯ ОЧИСТКА для предотвращения накопления данных
  const render = () => {
    if (isRendering) return;
    
    // Проверяем, изменилось ли состояние
    const currentState = {
      current: getState('weather.current'),
      loading: getState('weather.loading')
    };
    
    const stateChanged = !lastRenderState || 
      JSON.stringify(lastRenderState) !== JSON.stringify(currentState);
    
    if (!stateChanged) {
      Logger.debug('Состояние не изменилось, рендер пропущен');
      return;
    }
    
    isRendering = true;
    lastRenderState = currentState;
    
    try {
      Logger.debug('Выполняем принудительную полную очистку DOM');
      
      // ПОЛНАЯ ПРИНУДИТЕЛЬНАЯ ОЧИСТКА: Используем утилиты фреймворка
      clearChildren(element); // Используем утилиту фреймворка вместо innerHTML = ''
      element._vNode = null; // Сбрасываем кеш фреймворка
      
      // Убираем все классы и атрибуты, которые могли накопиться
      element.className = '';
      element.removeAttribute('style');
      
      renderComponent('weather-widget', {}, element);
      Logger.debug('Компонент отрендерен успешно');
    } catch (error) {
      Logger.error('Ошибка при рендеринге виджета:', error);
    } finally {
      isRendering = false;
    }
  };
  
  // Подписываемся на изменения состояния с debounce для предотвращения избыточных рендеров
  let renderTimeout;
  const debouncedRender = () => {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(render, 100); // Увеличили debounce до 100ms для меньшей частоты рендеров
  };
  
  // Подписки только на необходимые части состояния
  subscribe('weather.current', debouncedRender);
  subscribe('weather.loading', debouncedRender);
  
  // Настраиваем обработчики событий через систему делегирования фреймворка
  
  // Обработчик для кнопки поиска
  delegateEvent(element, 'click', '[data-action="search-weather"]', (e) => {
    e.preventDefault();
    const input = element.querySelector('[data-action="city-input"]');
    const cityName = input ? input.value.trim() : '';
    if (cityName && !getState('weather.loading')) {
      loadWeather(cityName);
    }
  }, { namespace: 'weather-widget' });

  // Обработчик для Enter в поле ввода
  delegateEvent(element, 'keypress', '[data-action="city-input"]', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      if (!getState('weather.loading')) {
        loadWeather(e.target.value.trim());
      }
    }
  }, { namespace: 'weather-widget' });

  // Обработчик для кнопок популярных городов
  delegateEvent(element, 'click', '[data-action="select-city"]', (e) => {
    e.preventDefault();
    const city = e.target.dataset.city;
    if (city && !getState('weather.loading')) {
      // Извлекаем название города без перевода в скобках для API
      const cityForAPI = city.split(' (')[0];
      // Устанавливаем значение в поле ввода используя DOM утилиты
      const input = element.querySelector('[data-action="city-input"]');
      if (input) {
        input.value = city;
      }
      loadWeather(cityForAPI);
    }
  }, { namespace: 'weather-widget' });

  Logger.info('Погодный виджет инициализирован');
  
  // Первичный рендер с небольшой задержкой
  setTimeout(render, 100);

  // Возвращаем функцию очистки для удаления всех обработчиков
  return () => {
    clearTimeout(renderTimeout);
    removeDelegateEventsByNamespace(element, 'weather-widget');
    unsubscribe('weather.current', debouncedRender);
    unsubscribe('weather.loading', debouncedRender);
    Logger.info('Погодный виджет размонтирован');
  };
}

// Экспортируем функцию загрузки для внешнего использования
export { loadWeather }; 