import { getState, setState } from 'framework/state.js';

export function PerformanceDashboard() {
  if (getState('performanceData') === undefined) {
    setState('performanceData', { cpu: 0, memory: 0 });
  }
  
  const updatePerformance = () => {
    const newData = {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 1000)
    };
    console.log('Обновление performanceData:', newData);
    setState('performanceData', newData);
  };

  return {
    tag: 'div',
    props: { class: 'performance-dashboard page' },
    children: [
      { tag: 'h2', children: 'Панель производительности' },
      { tag: 'p', props: { id: 'cpu' }, children: `CPU: ${getState('performanceData').cpu}%` },
      { tag: 'p', props: { id: 'memory' }, children: `Memory: ${getState('performanceData').memory}MB` }
    ],
    lifecycle: {
      mount: (node) => {
        console.info('PerformanceDashboard смонтирован', node);

        node.__performanceInterval = setInterval(updatePerformance, 10000);
        console.info('Интервал установлен на 10 сек');
      },
      update: (node) => {
        const data = getState('performanceData');
        const cpuEl = node.querySelector('#cpu');
        const memoryEl = node.querySelector('#memory');
        if (cpuEl) cpuEl.textContent = `CPU: ${data.cpu}%`;
        if (memoryEl) memoryEl.textContent = `Memory: ${data.memory}MB`;
      },
      unmount: (node) => {
        console.info('PerformanceDashboard размонтирован', node);

        if (node.__performanceInterval) {
          clearInterval(node.__performanceInterval);
          node.__performanceInterval = null;
        }
      }
    }
  };
}

