/**
 * File: SustainabilityRenderer.js
 * Draws sustainability start events with icon *inside* the circle, based on the assigned KEI.
 */
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import { append as svgAppend, attr as svgAttr, create as svgCreate } from 'tiny-svg';
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { hasExtensionElement, getExtensionElement } from './util.js';

const HIGH_PRIORITY = 2000;

export default class SustainabilityRenderer extends BaseRenderer {
  constructor(eventBus, bpmnRenderer) {
    super(eventBus, HIGH_PRIORITY);
    this.bpmnRenderer = bpmnRenderer;
  }

  canRender(element) {
    const bo = getBusinessObject(element);
    return is(element, 'bpmn:IntermediateThrowEvent') && hasExtensionElement(bo, 'bpmn4es:environmentalIndicators');
  }

  drawShape(parentGfx, element) {
    // Draw default BPMN StartEvent shape
    const shape = this.bpmnRenderer.drawShape(parentGfx, element);

    const bo = getBusinessObject(element);
    const indicators = getExtensionElement(bo, 'bpmn4es:environmentalIndicators');
    const kei = indicators?.indicators?.[0];

    if (kei?.icon) {
      // Draw icon inside StartEvent
      const iconText = svgCreate('text');
      svgAttr(iconText, {
        x: element.width / 2,
        y: element.height / 2 + 10,
        'font-size': '18px',
        'text-anchor': 'middle',
        'class': 'material-symbols-outlined'
        
      });
      iconText.textContent = kei.icon;
      svgAppend(parentGfx, iconText);
    }

    if (kei?.targetValue) {
      // Optional: display target value under icon
      const valueText = svgCreate('text');
      svgAttr(valueText, {
        x: element.width / 2,
        y: element.height / 2 + 35,
        'font-size': '11px',
        'text-anchor': 'middle',
        'fill': '#333'
      });
      valueText.textContent = kei.targetValue + ' ' + kei.unit;
      svgAppend(parentGfx, valueText);
    }

    return shape;
  }
}

SustainabilityRenderer.$inject = ['eventBus', 'bpmnRenderer'];
