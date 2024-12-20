import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';
import { getRoundRectPath } from 'bpmn-js/lib/draw/BpmnRenderUtil';
import { assign } from 'min-dash';
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import { componentsToPath, createLine } from 'diagram-js/lib/util/RenderUtil';
import { getExtensionElement, hasExtensionElement } from './util.js';

const HIGH_PRIORITY = 1500,
  TASK_BORDER_RADIUS = 2;

export default class KeiRenderer extends BaseRenderer {
  constructor(eventBus, bpmnRenderer, KeiContextPad) {
    super(eventBus, HIGH_PRIORITY);
    this.bpmnRenderer = bpmnRenderer;
    this.customContextPad = KeiContextPad; // Store the CustomContextPad instance
  }

  canRender(element) {
  	const businessObject = getBusinessObject(element);
  
  	// only render tasks and subprocesses with KEIs.
	  return isAny(element, [ 'bpmn:Task', 'bpmn:SubProcess' ]) && !element.labelTarget && hasExtensionElement(businessObject, 'bpmn4es:environmentalIndicators');
  }

  // TODO: Place the icon in the middle if there is no target value to display.
  drawShape(parentNode, element) {
    // The width and height of the box around the KEI.
    const KEI_WIDTH = 60;
  	const KEI_HEIGHT = 80;
  	// The amount of space between the BPMN element and the indicator.
  	const KEI_SPACING = 30;
  	// The size of the indicator icon in pixels.
  	const ICON_SIZE = 40;
  
  	const businessObject = getBusinessObject(element);
  	
  	let environmentalIndicators = getExtensionElement(businessObject, 'bpmn4es:environmentalIndicators');
		const indicator = environmentalIndicators.indicators[0];
  
  	console.log(indicator);
    
    // A text box for the icon, which is embedded in a font.
    const icon = svgCreate('text');
    //icon.setAttribute('x', element.width / 2); // Place the icon in the middle of the rectangle.
    //icon.setAttribute('y', -KEI_HEIGHT - KEI_SPACING + ICON_SIZE + 7); // Place the icon near the top.
	  svgAttr(icon, {
	    x: element.width / 2, // Place the icon in the middle of the rectangle.
	    y: -KEI_HEIGHT - KEI_SPACING + ICON_SIZE + 7, // Place the icon near the top.
	    'font-size': ICON_SIZE + 'px',
	    'class': 'material-symbols-outlined',
	    'text-anchor': 'middle' // Center the text
	  });
	  icon.textContent = indicator.icon; // The extension element itself carries the content that needs to be placed here in order to render the icon.
      
    // The rectangle for the KEI that is placed above the BPMN element.
    const rect = svgCreate('rect');
    svgAttr(rect, {
      x: 0,
      y: 0,
      'width': KEI_WIDTH,
      'height': KEI_HEIGHT,
      'fill': '#ffffff',
      'stroke': '#000000',
      transform: 'translate('+((element.width / 2) - (KEI_WIDTH / 2))+', '+(-KEI_HEIGHT - KEI_SPACING)+')'
    });
    
    // Define the line that connects the BPMN element to the KEI.
  	const startX = element.x + element.width; // Right edge of the task
		const startY = element.y + element.height / 2; // Vertical center of the task
		const line = svgCreate('line');
		svgAttr(line, {
		  'x1': element.width / 2, // Start point
		  'y1': 5, // Start point
		  'x2': element.width / 2, // End point
		  'y2': -KEI_HEIGHT, // End point
      'stroke': '#000', // Line color
      'stroke-width': '2', // Line thickness
      'stroke-dasharray': '5, 5' // 5px dash, 5px gap
    });
		
		// Draw the elements in reverse order to ensure that the line sits behind the BPMN element and KEI box and that the icon and text are placed on top of the KEI box.
		svgAppend(parentNode, line);
    svgAppend(parentNode, rect);
    svgAppend(parentNode, icon);
    
    if ( indicator.targetValue ) {
		  const text = svgCreate('text');
		  svgAttr(text, {
		    x: element.width / 2,
		    y: -KEI_SPACING - 12,
		    'font-size': '12px',
		    fill: '#000000',
		    opacity: 1,
		    'text-anchor': 'middle' // Center the text
		  });
		  text.textContent = indicator.targetValue + " " + indicator.unit;
		  
		  svgAppend(parentNode, text);
    }
    
    return this.bpmnRenderer.drawShape(parentNode, element);
  }

  getShapePath(shape) {
    if ( is(shape, 'bpmn:Task') || is(shape, 'bpmn:SubProcess')  ) {
      return getRoundRectPath(shape, TASK_BORDER_RADIUS);
    }
    return this.bpmnRenderer.getShapePath(shape);
  }
}

KeiRenderer.$inject = ['eventBus', 'bpmnRenderer'];
