const ELEMENT_SELECTOR_ID = 'data-element-selector-id';

function isInteractive(element, style) {
  return (
    element.tagName === 'A' ||
    element.tagName === 'INPUT' ||
    element.tagName === 'BUTTON' ||
    element.tagName === 'SELECT' ||
    element.tagName === 'TEXTAREA' ||
    element.hasAttribute('onclick') ||
    element.hasAttribute('onmousedown') ||
    element.hasAttribute('onmouseup') ||
    element.hasAttribute('onkeydown') ||
    element.hasAttribute('onkeyup') ||
    style.cursor === 'pointer'
  );
}

function isVisible(element, style) {
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    element.getAttribute('aria-hidden') !== 'true'
  );
}


function traverseDOM(window, node, pageElements) {
  var clonedNode = node.cloneNode(false);

  if (node.nodeType === window.Node.ELEMENT_NODE) {
    var element = node;
    var style = window.getComputedStyle(element);

    var clonedElement = clonedNode;

    pageElements.push(element);
    clonedElement.setAttribute('data-id', (pageElements.length - 1).toString());
    clonedElement.setAttribute(
      'data-interactive',
      isInteractive(element, style).toString()
    );
    clonedElement.setAttribute(
      'data-visible',
      isVisible(element, style).toString()
    );
  }

  node.childNodes.forEach(function (child) {
    var result = traverseDOM(window, child, pageElements);
    clonedNode.appendChild(result.clonedDOM);
  });

  return {
    pageElements: pageElements,
    clonedDOM: clonedNode,
  };
}

function getAnnotatedDOM(window, currentElements) {
  var result = traverseDOM(window, window.document.documentElement, currentElements);
  return result.clonedDOM.outerHTML;
}

async function getUniqueElementSelectorId(id, element, currentElements) {
  var element = currentElements[id];
  var uniqueId = await element.getAttribute(ELEMENT_SELECTOR_ID);
  if (uniqueId) return {
    uniqueId: uniqueId,
    element: element
  }
  uniqueId = Math.random().toString(36).substring(2, 10);
  await element.setAttribute(ELEMENT_SELECTOR_ID, uniqueId);
  return {
    uniqueId: uniqueId,
    element: element
  }
}

module.exports = {
  getAnnotatedDOM,
  getUniqueElementSelectorId
};  
