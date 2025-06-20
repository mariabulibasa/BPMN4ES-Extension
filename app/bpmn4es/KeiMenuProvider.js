import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { getExtensionElement } from './util.js';

const INDICATORS = [
	{
		category: "energy",
		indicators: [
			{
				name: "Energy Consumption",
				id: "energy-consumption",
				icon_name: "bolt",
				unit: "kwh"
			},
      {
				name: "Renewable Energy",
				id: "renewable-energy",
				icon_name: "sunny",
				unit: "kwh"
			},
			{
				name: "Transportation Energy",
				id: "transportation-energy",
				icon_name: "local_shipping",
				unit: "kwh"
			},
      { name: 'Battery',               
        id: 'battery-charging-full', 
        icon_name: 'battery_charging_full', 
        unit: '%'
      }
		]
	},
	{
		category: "emissions",
		indicators: [
			{
				name: "Carbon Emissions",
				id: "carbon-emissions",
				icon_name: "co2",
				unit: "kg"
			}
		]
	},
  {
    category: "waste",
    indicators: [
      {
        name: "Recyclable Waste",
        id: "recyclable-waste",
        icon_name: "recycling",
        unit: "kg"
      }
    ]
  }
];


export default function KeiMenuProvider(popupMenu, modeling, moddle, translate, eventBus, elementRegistry) {
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._translate = translate;
  this._moddle = moddle;
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;

	this._indicators = INDICATORS;

  this._popupMenu.registerProvider('kei-selector', this);
}

KeiMenuProvider.$inject = [
  'popupMenu',
  'modeling',
  'moddle',
  'translate',
  'eventBus',
  'elementRegistry',
];

KeiMenuProvider.prototype.getEntries = function(target) {
	const self = this;	
	
  const entries = self._indicators.flatMap(function(indicator) {
  	const category = indicator.category;
  	
  	return indicator.indicators.map(function(indicator) {
  		return {
		    title: self._translate(indicator.name),
		    label: self._translate(indicator.name),
		    className: 'kei-icon kei-icon-' + indicator.id,
		    id: indicator.id,
		    group: category,
        action: createAction(self, self._moddle, self._modeling, target, indicator)
      };
  	});
  });

  return entries;
};

// TODO: These values should be set through a properties panel.
function createAction(ctx, moddle, modeling, target, indicator) {
  return function(event, entry) {
    let targetValue = prompt(`Enter the target value for ${indicator.name} (leave empty if only monitored)`);    
    const enforced = !isNaN(parseFloat(targetValue)) && Number(targetValue) == parseFloat(targetValue);

    let keiProperties = { id: indicator.id, unit: indicator.unit, icon: indicator.icon_name };

    if (enforced) {
      keiProperties.targetValue = parseFloat(targetValue);
    }

    const businessObject = getBusinessObject(target);
    const extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

    // Get or create the environmentalIndicators extension element
    let environmentalIndicators = getExtensionElement(businessObject, 'bpmn4es:environmentalIndicators');
    if (!environmentalIndicators) {
      environmentalIndicators = moddle.create('bpmn4es:environmentalIndicators');
      environmentalIndicators.$parent = businessObject;
      extensionElements.get('values').push(environmentalIndicators);
    }

    // Enforce a single indicator by clearing any existing ones
    environmentalIndicators.get('indicators').length = 0;

    // Create and add the new KEI
    const kei = moddle.create('bpmn4es:keyEnvironmentalIndicator', keiProperties);
    kei.$parent = environmentalIndicators;
    environmentalIndicators.get('indicators').push(kei);

    // Update the element with the new extensionElements
    modeling.updateProperties(target, {
      extensionElements
    });

    const eventBus = ctx._eventBus;
    const elementRegistry = ctx._elementRegistry;

    const gfx = elementRegistry.getGraphics(target);
    eventBus.fire('render.shape', { element: target, gfx });

    //If this is a task, also rerender all attached boundary events
    if (target.type === 'bpmn:Task' || target.type === 'bpmn:Subprocess') {
      const boundaries = elementRegistry.getAll().filter(el =>
        el.type === 'bpmn:BoundaryEvent' && el.host === target
      );

      boundaries.forEach(boundary => {
        const boundaryGfx = elementRegistry.getGraphics(boundary);
        eventBus.fire('render.shape', { element: boundary, gfx: boundaryGfx });
      });
    }
  };
}

