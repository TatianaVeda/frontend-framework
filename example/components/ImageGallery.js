// example/components/ImageGallery.js
import { defineComponent } from 'framework/components.js';
import { setState, getState } from 'framework/state.js';
import { navigateTo } from 'framework/router.js';

// Настройки для бесплатных API изображений (БЕЗ ключей!)
const GALLERY_CONFIG = {
  // Бесплатные API источники (без регистрации!)
  SOURCES: {
    PICSUM: 'https://picsum.photos/',           // Lorem Ipsum для фото
    JSONPLACEHOLDER: 'https://jsonplaceholder.typicode.com/photos', // Тестовые данные
    UNSPLASH: 'https://api.unsplash.com/',      // Unsplash (demo режим)
    PLACEHOLDER: 'https://via.placeholder.com/' // Простые заглушки
  },
  
  // Демо-данные как fallback
  DEMO_IMAGES: [
    { id: 1, title: 'Mountain 🏔️ (demo)', src: '/android-chrome-192x192.png', desc: 'Beautiful mountain view' },
    { id: 2, title: 'City 🏙️ (demo)', src: '/favicon-32x32.png', desc: 'Modern city skyline' },
    { id: 3, title: 'Ocean 🌊 (demo)', src: '/android-chrome-512x512.png', desc: 'Peaceful ocean waves' },
    { id: 4, title: 'Forest 🌲 (demo)', src: '/apple-touch-icon.png', desc: 'Green forest path' }
  ]
};

// Функция получения реальных изображений БЕЗ ключей API
async function fetchGalleryImages(query = 'nature', count = 8) {
  console.log('=== Начинаем загрузку изображений ===');
  
  // 1. Попытка использовать Picsum (Lorem Ipsum для фото - БЕЗ ключей!)
  try {
    console.log('Загружаем изображения из Picsum...');
    const images = [];
    for (let i = 0; i < count; i++) {
      const randomId = Math.floor(Math.random() * 1000) + 1;
      images.push({
        id: i + 1,
        title: `Photo ${i + 1} 📷 (picsum)`,
        src: `https://picsum.photos/400/300?random=${randomId}`,
        desc: `Beautiful random photo from Picsum • ID: ${randomId}`
      });
    }
    console.log('✅ Picsum изображения созданы:', images.length);
    return images;
  } catch (error) {
    console.error('❌ Picsum недоступен:', error.message);
  }
  
  // 2. Попытка использовать JSONPlaceholder photos (БЕЗ ключей!)
  try {
    console.log('Загружаем изображения из JSONPlaceholder...');
    const response = await fetch('https://jsonplaceholder.typicode.com/photos');
    
    if (response.ok) {
      const data = await response.json();
      return data.slice(0, count).map((photo, index) => ({
        id: index + 1,
        title: `${photo.title} 🌐 (jsonplaceholder)`,
        src: photo.url,
        desc: `Album ID: ${photo.albumId} • Photo ID: ${photo.id}`
      }));
    }
  } catch (error) {
    console.log('JSONPlaceholder недоступен:', error.message);
  }
  
  // 3. Попытка использовать Placeholder изображения
  try {
    console.log('Создаём placeholder изображения...');
    const images = [];
    const colors = ['4f46e5', '059669', 'dc2626', 'ea580c', '7c3aed', '0891b2'];
    const subjects = ['nature', 'landscape', 'city', 'architecture', 'water', 'forest'];
    
    for (let i = 0; i < count; i++) {
      const color = colors[i % colors.length];
      const subject = subjects[i % subjects.length];
      images.push({
        id: i + 1,
        title: `${subject.charAt(0).toUpperCase() + subject.slice(1)} ${i + 1} 🖼️`,
        src: `https://via.placeholder.com/400x300/${color}/ffffff?text=${subject}+${i + 1}`,
        desc: `Placeholder ${subject} image • Color: #${color}`
      });
    }
    return images;
  } catch (error) {
    console.log('Placeholder API недоступен:', error.message);
  }
  
  // Fallback на демо изображения
  console.log('Используем демо-изображения для галереи');
  return GALLERY_CONFIG.DEMO_IMAGES;
}

// Функция для загрузки изображений гор
async function fetchMountainImages(count = 6) {
  // Попытка использовать Unsplash API
  try {
    console.log('Загружаем изображения гор из Unsplash...');
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=mountain,landscape&per_page=${count}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID demo_key` // Можно работать без ключа в demo режиме
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.results.map((photo, index) => ({
        id: index + 1,
        title: `${photo.alt_description || `Mountain ${index + 1}`} 🏔️`,
        src: photo.urls.regular,
        desc: `By ${photo.user.name} • ${photo.likes} ❤️ • Unsplash`
      }));
    }
  } catch (error) {
    console.log('Unsplash недоступен для гор, используем Picsum...');
  }
  
  // Fallback на Picsum
  try {
    console.log('Загружаем изображения гор из Picsum...');
    const images = [];
    for (let i = 0; i < count; i++) {
      const randomId = Math.floor(Math.random() * 1000) + 1;
      images.push({
        id: i + 1,
        title: `Mountain ${i + 1} 🏔️`,
        src: `https://picsum.photos/400/300?random=${randomId}`,
        desc: `Beautiful mountain landscape • Picsum ID: ${randomId}`
      });
    }
    return images;
  } catch (error) {
    console.error('Ошибка загрузки изображений гор:', error.message);
    return GALLERY_CONFIG.DEMO_IMAGES;
  }
}

// Функция для загрузки изображений городов
async function fetchCityImages(count = 6) {
  try {
    console.log('Загружаем изображения городов...');
    const images = [];
    for (let i = 0; i < count; i++) {
      const randomId = Math.floor(Math.random() * 1000) + 1;
      images.push({
        id: i + 1,
        title: `City ${i + 1} 🏙️`,
        src: `https://picsum.photos/400/300?random=${randomId}&grayscale=0`,
        desc: `Urban cityscape • Picsum ID: ${randomId}`
      });
    }
    return images;
  } catch (error) {
    console.error('Ошибка загрузки изображений городов:', error.message);
    return GALLERY_CONFIG.DEMO_IMAGES;
  }
}

// Функция для загрузки изображений океана
async function fetchOceanImages(count = 6) {
  try {
    console.log('Загружаем изображения океана...');
    const images = [];
    for (let i = 0; i < count; i++) {
      const randomId = Math.floor(Math.random() * 1000) + 1;
      images.push({
        id: i + 1,
        title: `Ocean ${i + 1} 🌊`,
        src: `https://picsum.photos/400/300?random=${randomId}`,
        desc: `Peaceful ocean view • Picsum ID: ${randomId}`
      });
    }
    return images;
  } catch (error) {
    console.error('Ошибка загрузки изображений океана:', error.message);
    return GALLERY_CONFIG.DEMO_IMAGES;
  }
}

// Функция для загрузки изображений леса
async function fetchForestImages(count = 6) {
  try {
    console.log('Загружаем изображения леса...');
    const images = [];
    for (let i = 0; i < count; i++) {
      const randomId = Math.floor(Math.random() * 1000) + 1;
      images.push({
        id: i + 1,
        title: `Forest ${i + 1} 🌲`,
        src: `https://picsum.photos/400/300?random=${randomId}&sepia=0`,
        desc: `Green forest landscape • Picsum ID: ${randomId}`
      });
    }
    return images;
  } catch (error) {
    console.error('Ошибка загрузки изображений леса:', error.message);
    return GALLERY_CONFIG.DEMO_IMAGES;
  }
}

// Изначально используем демо-данные
let GALLERY_IMAGES = GALLERY_CONFIG.DEMO_IMAGES;

// Основной компонент галереи
defineComponent('image-gallery', (props) => {
  const images = getState('gallery.images') || GALLERY_IMAGES;
  const selectedId = getState('gallery.selectedId');
  
  return {
    tag: 'div',
    props: { class: 'image-gallery' },
    children: [
      { tag: 'h1', children: ['📸 Image Gallery'] },
              {
          tag: 'div',
          props: { class: 'gallery-controls' },
          children: [
            {
              tag: 'button',
              props: { type: 'button' },
              events: {
                click: async (e) => {
                  e.preventDefault();
                  console.log('🎲 Клик по кнопке "Случайные фото"');
                  setState('gallery.loading', true);
                  try {
                    const newImages = await fetchGalleryImages('random', 8);
                    setState('gallery.images', newImages);
                    GALLERY_IMAGES = newImages;
                  } catch (error) {
                    console.error('Ошибка загрузки изображений:', error);
                  } finally {
                    setState('gallery.loading', false);
                  }
                }
              },
              children: ['🎲 Случайные фото']
            },
            {
              tag: 'button',
              props: { type: 'button' },
              events: {
                click: async (e) => {
                  e.preventDefault();
                  console.log('🏔️ Клик по кнопке "Горы"');
                  setState('gallery.loading', true);
                  try {
                    const newImages = await fetchMountainImages(6);
                    setState('gallery.images', newImages);
                    GALLERY_IMAGES = newImages;
                  } catch (error) {
                    console.error('Ошибка загрузки гор:', error);
                  } finally {
                    setState('gallery.loading', false);
                  }
                }
              },
              children: ['🏔️ Горы']
            },
            {
              tag: 'button',
              props: { type: 'button' },
              events: {
                click: async (e) => {
                  e.preventDefault();
                  console.log('🏙️ Клик по кнопке "Города"');
                  setState('gallery.loading', true);
                  try {
                    const newImages = await fetchCityImages(6);
                    setState('gallery.images', newImages);
                    GALLERY_IMAGES = newImages;
                  } catch (error) {
                    console.error('Ошибка загрузки городов:', error);
                  } finally {
                    setState('gallery.loading', false);
                  }
                }
              },
              children: ['🏙️ Города']
            },
            {
              tag: 'button',
              props: { type: 'button' },
              events: {
                click: async (e) => {
                  e.preventDefault();
                  console.log('🌊 Клик по кнопке "Океан"');
                  setState('gallery.loading', true);
                  try {
                    const newImages = await fetchOceanImages(6);
                    setState('gallery.images', newImages);
                    GALLERY_IMAGES = newImages;
                  } catch (error) {
                    console.error('Ошибка загрузки океана:', error);
                  } finally {
                    setState('gallery.loading', false);
                  }
                }
              },
              children: ['🌊 Океан']
            },
            {
              tag: 'button',
              props: { type: 'button' },
              events: {
                click: async (e) => {
                  e.preventDefault();
                  console.log('🌲 Клик по кнопке "Лес"');
                  setState('gallery.loading', true);
                  try {
                    const newImages = await fetchForestImages(6);
                    setState('gallery.images', newImages);
                    GALLERY_IMAGES = newImages;
                  } catch (error) {
                    console.error('Ошибка загрузки леса:', error);
                  } finally {
                    setState('gallery.loading', false);
                  }
                }
              },
              children: ['🌲 Лес']
            }
          ]
        },
      getState('gallery.loading') ? 
        { tag: 'div', props: { class: 'loading' }, children: ['⏳ Загружаем изображения...'] } : null,
      {
        tag: 'div',
        props: { class: 'gallery-grid' },
        children: images.map(img => ({
          tag: 'div',
          props: { 
            class: 'gallery-item',
            'data-id': img.id
          },
          events: {
            click: () => {
              setState('gallery.selectedId', img.id);
              navigateTo(`/gallery/${img.id}`);
            }
          },
          children: [
            {
              tag: 'img',
              props: {
                src: img.src,
                alt: img.title,
                class: 'gallery-image'
              }
            },
            { tag: 'h3', children: [img.title] },
            { tag: 'p', children: [img.desc] }
          ]
        }))
      },
      selectedId ? {
        tag: 'div',
        props: { class: 'modal-overlay' },
        events: {
          click: () => {
            setState('gallery.selectedId', null);
            navigateTo('/gallery');
          }
        },
        children: [
          {
            tag: 'div',
            props: { class: 'modal-content' },
            children: [
              {
                tag: 'button',
                props: { class: 'close-btn' },
                events: {
                  click: () => {
                    setState('gallery.selectedId', null);
                    navigateTo('/gallery');
                  }
                },
                children: ['×']
              },
              (() => {
                const selected = images.find(img => img.id === selectedId);
                return selected ? [
                  { tag: 'img', props: { src: selected.src, alt: selected.title } },
                  { tag: 'h2', children: [selected.title] },
                  { tag: 'p', children: [selected.desc] }
                ] : [];
              })()
            ]
          }
        ]
      } : null
    ].filter(Boolean)
  };
});

export function initImageGallery() {
  console.log('Инициализация галереи изображений...');
  
  setState('gallery', {
    images: GALLERY_IMAGES,
    selectedId: null,
    loading: false
  });
  
  console.log('Галерея инициализирована');
}

export function selectImage(id) {
  setState('gallery.selectedId', parseInt(id));
}

export { GALLERY_IMAGES }; 