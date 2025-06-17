// example/components/WeatherWidget.js
import { defineComponent, renderComponent, bindComponentToStateWithDeps } from 'framework/components.js';
import { setState, getState, subscribe } from 'framework/state.js';
import { getData } from 'framework/api.js';
import { Config } from 'framework/config.js';

// Популярные города для быстрого выбора (на разных языках)
const POPULAR_CITIES = [
  'London', 'New York', '東京 (Tokyo)', 'Москва', 'Paris', 'Berlin', 'Rome', 'Madrid',
  'Amsterdam', '北京 (Beijing)', 'Sydney', 'Toronto', 'Санкт-Петербург', 'Київ (Kiev)'
];

// Карта кодов погоды wttr.in в эмодзи (специфично для погодного виджета)
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

// Настройки для погодного виджета
const CACHE_TIMEOUT = 10 * 60 * 1000; // 10 минут
const REQUEST_TIMEOUT = 5000; // 5 секунд

// Простое кеширование на уровне приложения
const weatherCache = new Map();

// Функция для получения данных о погоде через wttr.in с использованием фреймворка
async function fetchWeatherData(city) {
  // Проверяем кеш
  const cacheKey = city.toLowerCase();
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TIMEOUT) {
    console.log('Используем кешированные данные для:', city);
    return cached.data;
  }
  
  try { 
    // Используем прямой fetch для внешнего API, чтобы избежать конфликтов с заголовками фреймворка
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    console.log('Запрос погоды для:', city, 'URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'curl/7.64.1' // wttr.in лучше работает с curl user-agent
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Получены данные погоды:', data);
    
    if (data.current_condition && data.current_condition[0]) {
      const current = data.current_condition[0];
      
      const result = {
        city: city,
        temp: Math.round(current.temp_C),
        weather: current.weatherDesc[0].value,
        icon: WEATHER_ICONS[current.weatherCode] || DEFAULT_WEATHER_ICON,
        source: 'wttr.in'
      };
      
      // Сохраняем в кеш
      weatherCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } else {
      throw new Error('Неполные данные от API');
    }
  } catch (error) {
    console.error(`Ошибка при получении погоды для ${city}:`, error);
    throw error;
  }
}

// Компонент погоды
defineComponent('weather-widget', (props) => {
  const currentWeather = getState('weather.current');
  const loading = getState('weather.loading');
  
  // Временная отладка
  console.log('Рендер компонента. loading:', loading, 'currentWeather:', !!currentWeather);
  
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
    props: { class: `weather-widget${loading ? ' loading' : ''}` },
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
                  placeholder: 'Например: Москва, London, 東京...'
                  // Убираем value: inputValue, чтобы поле управляло своим значением
                },
                events: {
                  // Убираем обработчик input - он не нужен
                  keypress: (e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault(); // Предотвращаем отправку формы
                      loadWeather(e.target.value.trim());
                    }
                  }
                }
              },
              {
                tag: 'button',
                props: { 
                  class: 'search-btn',
                  type: 'button'
                },
                events: {
                  click: (e) => {
                    e.preventDefault(); // Предотвращаем стандартное поведение
                    const input = document.querySelector('.city-input');
                    const cityName = input ? input.value.trim() : '';
                    if (cityName && !getState('weather.loading')) {
                      loadWeather(cityName);
                    }
                  }
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
                type: 'button'
              },
              events: {
                click: (e) => {
                  e.preventDefault(); // Предотвращаем стандартное поведение
                  console.log('Клик по городу:', city, 'текущее состояние loading:', getState('weather.loading'));
                  if (!getState('weather.loading')) {
                    // Извлекаем название города без перевода в скобках для API
                    const cityForAPI = city.split(' (')[0]; // Берем только часть до скобок
                    // Устанавливаем значение напрямую в поле ввода (с переводом для показа)
                    const input = document.querySelector('.city-input');
                    if (input) {
                      input.value = city; // Показываем полное название с переводом
                    }
                    loadWeather(cityForAPI); // Отправляем в API только оригинальное название
                  }
                }
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

// Функция загрузки погоды с использованием фреймворка
async function loadWeather(city) {
  console.log('Начинаем загрузку погоды для:', city);
  setState('weather.loading', true);
  console.log('Установили loading: true');
  
  try {
    const weatherData = await fetchWeatherData(city);
    console.log('Получили данные:', weatherData);
    setState('weather.current', weatherData);
    console.log('Установили состояние weather.current:', getState('weather.current'));
  } catch (error) {
    console.error('Ошибка загрузки погоды:', error);
    const errorData = {
      city: city,
      temp: '--',
      weather: 'Не удалось загрузить данные. Проверьте название города.',
      icon: '❌',
      source: 'error'
    };
    console.log('Устанавливаем данные об ошибке:', errorData);
    setState('weather.current', errorData);
    console.log('Установили данные об ошибке');
  } finally {
    setState('weather.loading', false);
    console.log('Установили loading: false. Финальное состояние:', getState('weather'));
  }
}

// Инициализация виджета
export function initWeatherWidget() {
  console.log('Инициализация погодного виджета...');
  
  // Инициализируем состояние
  setState('weather', {
    current: null,
    loading: false
  });
  
  let isRendering = false; // Флаг для предотвращения множественных рендеров
  
  // Функция для рендеринга
  const render = () => {
    if (isRendering) return; // Предотвращаем множественные рендеры
    isRendering = true;
    
    const element = document.getElementById('weather-widget');
    if (element) {
      // ПРИНУДИТЕЛЬНАЯ ОЧИСТКА: Полностью очищаем контейнер перед каждым рендером
      // Это необходимо из-за проблем в фреймворке с накоплением элементов
      element.innerHTML = '';
      element._vNode = null; // Сбрасываем кеш фреймворка
      
      renderComponent('weather-widget', {}, element);
    }
    
    isRendering = false;
  };
  
  // Подписываемся на изменения состояния с debounce
  let renderTimeout;
  const debouncedRender = () => {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(render, 10);
  };
  
  subscribe('weather.current', debouncedRender);
  subscribe('weather.loading', debouncedRender);
  // Убираем подписку на inputValue, чтобы избежать рендера при каждой букве
  // subscribe('weather.inputValue', debouncedRender);
  
  console.log('Подписки созданы');
  
  // Первичный рендер с небольшой задержкой
  setTimeout(render, 10);
}

// Экспортируем функцию загрузки для внешнего использования
export { loadWeather }; 