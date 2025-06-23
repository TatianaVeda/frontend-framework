import { subscribe, unsubscribe, getState, setState, beginDependencyCollection, endDependencyCollection } from 'framework/state.js';
import { Config } from 'framework/config.js';
import Logger from 'framework/logger.js';

const components = new Map();

function changed(v1, v2) {
  return (
    typeof v1 !== typeof v2 ||
    (typeof v1 === 'string' && v1 !== v2) ||
    v1.tag !== v2.tag
  );
}

export function renderVNode(vnode) {
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }
  if (vnode instanceof Node) {
    return vnode;
  }
  const el = document.createElement(vnode.tag);
  if (vnode.key != null) {
    el.setAttribute("data-key", vnode.key);
  }
  if (vnode.props) {
    Object.entries(vnode.props).forEach(([key, value]) => {
      if (key === 'class') {
        el.className = value;
      } else {
        el.setAttribute(key, value);
      }
    });
  }
  if (vnode.events) {
    Object.entries(vnode.events).forEach(([eventName, handler]) => {
      el.addEventListener(eventName, handler);
    });
  }
  let children = vnode.children;
  if (children != null && !Array.isArray(children)) {
    children = [children];
  }
  if (children && children.length > 0) {
    children.forEach(child => el.appendChild(renderVNode(child)));
  }
  return el;
}

let pendingBatchUpdates = [];
let isBatchScheduled = false;

function scheduleBatchUpdate(fn) {
  pendingBatchUpdates.push(fn);
  if (!isBatchScheduled) {
    isBatchScheduled = true;
    requestAnimationFrame(runBatchUpdates);
  }
}

function runBatchUpdates() {
  pendingBatchUpdates.forEach(fn => {
    try {
      fn();
    } catch (err) {
      Logger.error('Error in batch update:', err);
    }
  });
  pendingBatchUpdates = [];
  isBatchScheduled = false;
}

function diffAndPatch(parent, oldVNode, newVNode, index = 0) {
  let domNode = parent.childNodes[index];

  if (newVNode === undefined) {
    if (oldVNode && oldVNode.lifecycle && typeof oldVNode.lifecycle.unmount === 'function') {
      try {
        oldVNode.lifecycle.unmount(domNode);
      } catch (err) {
        Logger.error('Error in unmount component method:', err);
      }
    }
    if (domNode) {
      parent.removeChild(domNode);
    }
    return;
  }

  if (!oldVNode) {
    const newDomNode = renderVNode(newVNode);
    parent.appendChild(newDomNode);
    if (newVNode.lifecycle && typeof newVNode.lifecycle.mount === 'function') {
      try {
        newVNode.lifecycle.mount(newDomNode);
      } catch (err) {
        Logger.error('Error in mount component method:', err);
      }
    }
    return;
  }

  if (!domNode) {
    const newDomNode = renderVNode(newVNode);
    parent.appendChild(newDomNode);
    if (newVNode.lifecycle && typeof newVNode.lifecycle.mount === 'function') {
      try {
        newVNode.lifecycle.mount(newDomNode);
      } catch (err) {
        Logger.error('Error in mount component method (when domNode is missing):', err);
      }
    }
    return;
  }

  if (changed(oldVNode, newVNode)) {
    if (oldVNode.lifecycle && typeof oldVNode.lifecycle.unmount === 'function') {
      try {
        oldVNode.lifecycle.unmount(domNode);
      } catch (err) {
        Logger.error('Error in unmount component method when replacing:', err);
      }
    }
    const newDomNode = renderVNode(newVNode);
    parent.replaceChild(newDomNode, domNode);
    if (newVNode.lifecycle && typeof newVNode.lifecycle.mount === 'function') {
      try {
        newVNode.lifecycle.mount(newDomNode);
      } catch (err) {
        Logger.error('Error in mount component method when replacing:', err);
      }
    }
  } else if (newVNode.tag) {
    if (newVNode.dynamic) {
      if (newVNode.lifecycle && typeof newVNode.lifecycle.update === 'function') {
        try {
          scheduleBatchUpdate(() => {
            newVNode.lifecycle.update(domNode, oldVNode, newVNode);
          });
        } catch (err) {
          Logger.error('Error in update dynamic component method:', err);
        }
      }
      return;
    }
    if (newVNode.lifecycle && typeof newVNode.lifecycle.update === 'function') {
      try {
        newVNode.lifecycle.update(domNode);
      } catch (err) {
        Logger.error('Error in update component method:', err);
      }
    }
    let oldChildren = oldVNode.children;
    if (oldChildren != null && !Array.isArray(oldChildren)) {
      oldChildren = [oldChildren];
    }
    let newChildren = newVNode.children;
    if (newChildren != null && !Array.isArray(newChildren)) {
      newChildren = [newChildren];
    }
    if (newChildren && newChildren.some(child => child && child.key != null)) {
      let childContainer = parent.childNodes[index];
      if (childContainer) {
        keyedDiffAndPatch(childContainer, oldChildren || [], newChildren);
      }
    } else {
      const max = Math.max(oldChildren ? oldChildren.length : 0, newChildren ? newChildren.length : 0);
      for (let i = 0; i < max; i++) {
        let childContainer = parent.childNodes[index];
        if (childContainer) {
          diffAndPatch(childContainer,
            oldChildren ? oldChildren[i] : undefined,
            newChildren ? newChildren[i] : undefined,
            i);
        }
      }
    }
  }
}

function keyedDiffAndPatch(domParent, oldChildren, newChildren) {
  const oldKeyMap = {};
  oldChildren.forEach((child, i) => {
    if (child && child.key != null) {
      oldKeyMap[child.key] = { child, index: i };
    }
  });
  newChildren.forEach((newChild, newIndex) => {
    if (newChild && newChild.key != null) {
      const key = newChild.key;
      if (oldKeyMap.hasOwnProperty(key)) {
        const { child: oldChild } = oldKeyMap[key];
        diffAndPatch(domParent, oldChild, newChild, newIndex);
      } else {
        const newDomNode = renderVNode(newChild);
        if (newIndex >= domParent.childNodes.length) {
          domParent.appendChild(newDomNode);
        } else {
          domParent.insertBefore(newDomNode, domParent.childNodes[newIndex]);
        }
      }
    } else {
      diffAndPatch(domParent, oldChildren[newIndex], newChild, newIndex);
    }
  });
  oldChildren.forEach(oldChild => {
    if (oldChild && oldChild.key != null) {
      const key = oldChild.key;
      const stillExists = newChildren.some(newChild => newChild && newChild.key === key);
      if (!stillExists) {
        for (let i = 0; i < domParent.childNodes.length; i++) {
          const domNode = domParent.childNodes[i];
          if (domNode.getAttribute && domNode.getAttribute("data-key") === key) {
            if (oldChild.lifecycle && typeof oldChild.lifecycle.unmount === 'function') {
              try {
                oldChild.lifecycle.unmount(domNode);
              } catch (err) {
                Logger.error('Error in unmount component method when removing:', err);
              }
            }
            domParent.removeChild(domNode);
            break;
          }
        }
      }
    }
  });
}

export function defineComponent(name, renderFunction) {
  components.set(name, (props) => {
    const children = props.children || [];
    return renderFunction({ ...props, children });
  });
}

export function createComponentVNode(name, props = {}) {
  if (!components.has(name)) {
    throw new Error(`Component "${name}" is not defined.`);
  }
  const renderFunction = components.get(name);
  return renderFunction(props);
}

export function renderComponent(name, props = {}, parent) {
  console.log(`Rendering component: ${name}`, props);
  console.log(`Target element:`, parent);
  
  if (!components.has(name)) {
    throw new Error(`Component "${name}" is not defined.`);
  }
  const renderFunction = components.get(name);
  const newVNode = renderFunction(props);
  
  if (!parent._vNode || parent._vNode.tag !== newVNode.tag) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
    parent._vNode = newVNode;
    const newDomNode = renderVNode(newVNode);
    parent.appendChild(newDomNode);
    if (newVNode.lifecycle && typeof newVNode.lifecycle.mount === 'function') {
      try {
        newVNode.lifecycle.mount(newDomNode);
      } catch (err) {
        Logger.error('Error in mount component method:', err);
      }
    }
  } else {

    diffAndPatch(parent, parent._vNode, newVNode);
    parent._vNode = newVNode;
  }
  return parent;
}

export function bindComponentToStateWithDeps(name, props, parent) {
  let subscriptions = new Set();

  function update() {
    subscriptions.forEach(dep => {
      unsubscribe(dep, update);
    });
    subscriptions.clear();

    const deps = new Set();
    beginDependencyCollection(deps);
    try {
      renderComponent(name, props, parent);
    } catch (err) {
      Logger.error(`Error in rendering component "${name}":`, err);
    }
    endDependencyCollection();

    deps.forEach(dep => {
      subscribe(dep, update);
      subscriptions.add(dep);
    });
  }

  update();

  return {
    mount: update,
    unmount: () => {
  
       if (parent._vNode && parent._vNode.lifecycle && typeof parent._vNode.lifecycle.unmount === 'function') {
        const domNode = parent.firstChild;
        try {
          parent._vNode.lifecycle.unmount(domNode);
        } catch (err) {
          Logger.error(`Error in unmounting component "${name}":`, err);
        }
      }
      subscriptions.forEach(dep => {
        unsubscribe(dep, update);
      });
  
      subscriptions.clear();
    }
  };
}

export function bindComponentToState(name, props, parent) {
  subscribe(() => renderComponent(name, props, parent));
}

function throttleFunction(fn, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

export function VirtualList({ items, renderItem, 
  itemHeight = Config.components.virtualList.itemHeight, 
  containerHeight = Config.components.virtualList.containerHeight, 
  buffer = Config.components.virtualList.buffer } = {}) {
  
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.height = containerHeight + 'px';
  container.style.overflowY = 'auto';
  
  const spacer = document.createElement('div');
  spacer.style.height = (items.length * itemHeight) + 'px';
  container.appendChild(spacer);
  
  function renderVisible() {
    const scrollTop = container.scrollTop;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer);
    const existing = container.querySelectorAll('.virtual-item');
    existing.forEach(el => el.remove());
    
    for (let i = startIndex; i < endIndex; i++) {

      const vNode = renderItem(items[i], i);
  
      const itemEl = renderVNode(vNode);
      itemEl.classList.add('virtual-item');
      itemEl.style.position = 'absolute';
      itemEl.style.top = (i * itemHeight) + 'px';
      container.appendChild(itemEl);
    }
  }
  
  container.addEventListener('scroll', throttleFunction(renderVisible, 100));
  renderVisible();
  
  return container;
}
