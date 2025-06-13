import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import { append as svgAppend, attr as svgAttr, create as svgCreate, remove as svgRemove } from 'tiny-svg';
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { hasExtensionElement, getExtensionElement } from './util.js';

const HIGH_PRIORITY = 2001;

export default class KeiEventRenderer extends BaseRenderer {
  constructor(eventBus, bpmnRenderer) {
    super(eventBus, HIGH_PRIORITY);
    this.bpmnRenderer = bpmnRenderer;
  }

  canRender(element) {
    const bo = getBusinessObject(element);
    // Only render intermediate throws & boundary events with a KEI
    return (is(element, 'bpmn:IntermediateThrowEvent') || is(element, 'bpmn:BoundaryEvent') || is(element, 'bpmn:IntermediateCatchEvent') || is(element, 'bpmn:StartEvent'))
      && !element.labelTarget
      && hasExtensionElement(bo, 'bpmn4es:environmentalIndicators');
  }

  drawShape(parentGfx, element) {
    // Clear previous event and KEI decorations 
    Array.from(parentGfx.childNodes).forEach(node => svgRemove(node));

    // Draw the normal BPMN event 
    const shape = this.bpmnRenderer.drawShape(parentGfx, element);

    // Render KEI icon and value
    const bo  = getBusinessObject(element);
    const env = getExtensionElement(bo, 'bpmn4es:environmentalIndicators');
    const kei = env.indicators[0];

    if (kei?.icon) {
      const iconText = svgCreate('text');
      svgAttr(iconText, {
        'class': 'material-symbols-outlined kei-deco',
        x: element.width / 2,
        y: element.height / 2 + 10,
        'font-size': '18px',
        'text-anchor': 'middle'
      });
      iconText.textContent = kei.icon;
      svgAppend(parentGfx, iconText);
    }

    if (kei?.targetValue) {
      const valueText = svgCreate('text');
      svgAttr(valueText, {
        'class': 'kei-deco',
        x: element.width / 2,
        y: element.height / 2 + 35,
        'font-size': '11px',
        'text-anchor': 'middle',
        fill: '#333'
      });
      valueText.textContent = kei.targetValue + ' ' + kei.unit;
      svgAppend(parentGfx, valueText);
    }

    return shape;
  }
}

KeiEventRenderer.$inject = ['eventBus', 'bpmnRenderer'];
