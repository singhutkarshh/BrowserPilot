function generateSimplifiedDom(
  element,
  interactiveElements,
  window
) {
  if (element.nodeType === window.Node.TEXT_NODE && element.textContent?.trim()) {
    return window.document.createTextNode(element.textContent + ' ');
  }

  if (!(element instanceof window.HTMLElement || element instanceof window.SVGElement))
    return null;

  const isVisible = element.getAttribute('data-visible') === 'true';
  if (!isVisible) {
    return null;
  }

  let children = Array.from(element.childNodes)
    .map((c) => generateSimplifiedDom(c, interactiveElements, window))
    .filter((c) => Boolean(c));

  // Don't bother with text that is the direct child of the body  
  if (element.tagName === 'BODY')
    children = children.filter((c) => c.nodeType !== window.Node.TEXT_NODE);

  const interactive =
    element.getAttribute('data-interactive') === 'true' ||
    element.hasAttribute('role');
  const hasLabel =
    element.hasAttribute('aria-label') || element.hasAttribute('name');
  const includeNode = interactive || hasLabel;

  if (!includeNode && children.length === 0) return null;
  if (!includeNode && children.length === 1) {
    return children[0];
  }

  const container = window.document.createElement(element.tagName);

  const allowedAttributes = [
    'aria-label',
    'data-name',
    'name',
    'type',
    'placeholder',
    'value',
    'role',
    'title',
  ];

  for (const attr of allowedAttributes) {
    if (element.hasAttribute(attr)) {
      container.setAttribute(attr, element.getAttribute(attr));
    }
  }
  if (interactive) {
    interactiveElements.push(element);
    container.setAttribute('id', element.getAttribute('data-id'));
  }

  children.forEach((child) => {
    container.appendChild(child)
  }
  );

  return container;
}

module.exports = generateSimplifiedDom;  
