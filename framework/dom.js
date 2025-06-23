// /dot-js/framework/dom.js


export function createElement(tagName, attributes = {}) {
    const element = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'class') {
        element.className = value;
      } else if (key === 'data' && typeof value === 'object') {
  
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });
    return element;
  }
  
  export function appendChild(parent, child) {
    parent.appendChild(child);
  }
  
  export function clearChildren(parent) {
    if (!parent) {
      console.error('Element not found. Check if you are passing the correct element.');
      return;
    }
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }
  
  export function setTextContent(element, text) {
    if (!element) {
      console.error('Element not found. Check if you are passing the correct element.');
      return;
    }
    element.textContent = text;
  }
  
  export function toggleClass(element, className, add = true) {
    if (add) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }
  
  export function setStyle(element, styles = {}) {
    Object.entries(styles).forEach(([prop, value]) => {
      element.style[prop] = value;
    });
  }
  
  export function removeStyle(element, ...styleProps) {
    styleProps.forEach(prop => {
      element.style.removeProperty(prop);
    });
  }
  
  export function setAttribute(element, attr, value) {
    element.setAttribute(attr, value);
  }
  
  export function removeAttribute(element, attr) {
    element.removeAttribute(attr);
  }
  
  export function batchAppendChildren(parent, children = []) {
    if (!parent) {
      console.error('Parent element not found for batchAppendChildren.');
      return;
    }
    const fragment = document.createDocumentFragment();
    children.forEach(child => {
      fragment.appendChild(child);
    });
    parent.appendChild(fragment);
  }
  
  export function batchReplaceChildren(parent, newChildren = []) {
    if (!parent) {
      console.error('Parent element not found for batchReplaceChildren.');
      return;
    }

    clearChildren(parent);

    batchAppendChildren(parent, newChildren);
  }
  
  export function batchRemoveElements(elements = []) {
    elements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }
  