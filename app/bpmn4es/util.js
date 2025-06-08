export function getExtensionElement(element, type) {
  if (!element.extensionElements) {
    return;
  }

  return element.extensionElements.get('values').filter((extensionElement) => {
    return extensionElement.$instanceOf(type);
  })[0];
}


export function hasExtensionElement(element, type) {
  return getExtensionElement(element, type) !== undefined;
}


export function getStartPosition(contextPad, element) {
  const Y_OFFSET = 5;
  const pad = contextPad.getPad(element).html;
  const rect = pad.getBoundingClientRect();

  return {
    x: rect.left,
    y: rect.bottom + Y_OFFSET
  };
}


