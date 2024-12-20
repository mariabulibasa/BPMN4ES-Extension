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
				name: "Transportation Energy",
				id: "transportation-energy",
				icon_name: "local_shipping",
				unit: "kwh"
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
	}
];


export default function KeiMenuProvider(config, bpmnRendererConfig, popupMenu, modeling, moddle, translate) {
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._translate = translate;
  this._moddle = moddle;

	this._indicators = INDICATORS;

  this._popupMenu.registerProvider('kei-selector', this);
}

KeiMenuProvider.$inject = [
  'config.colorPicker',
  'config.bpmnRenderer',
  'popupMenu',
  'modeling',
  'moddle',
  'translate'
];

KeiMenuProvider.prototype.getEntries = function(target) {
	const self = this;	
	
  const entries = self._indicators.flatMap(function(indicator) {
  	const category = indicator.category;
  	
  	return indicator.indicators.map(function(indicator) {
  		return {
		    title: self._translate(indicator.name),
		    label: self._translate(indicator.name),
		    //imageUrl: indicator.icon,
		    className: 'kei-icon kei-icon-' + indicator.id,
		    id: indicator.id,
		    group: category,
		    action: createAction(self._moddle, self._modeling, target, indicator)
		  };
  	});
  });

  return entries;
};

function createAction(moddle, modeling, target, indicator) {
  return function(event, entry) {
  	console.log(target);
  	
		let targetValue = prompt(`Enter the target value for ${indicator.name} (leave empty if only monitored)`);    
    const enforced = !isNaN(parseFloat(targetValue)) && Number(targetValue) == parseFloat(targetValue);
    
    let keiProperties = { id: indicator.id, unit: indicator.unit, icon: indicator.icon_name };
    
    if ( enforced ) { // If enforced is true here, it should be ensured that the target value is a valid floating point number.
    	keiProperties.targetValue = parseFloat(targetValue);
    }
  	
  	const businessObject = getBusinessObject(target);
  	const extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');
  	
  	let environmentalIndicators = getExtensionElement(businessObject, 'bpmn4es:environmentalIndicators');
  	
  	if (!environmentalIndicators) {
			environmentalIndicators = moddle.create('bpmn4es:environmentalIndicators');
			environmentalIndicators.$parent = businessObject;
			extensionElements.get('values').push(environmentalIndicators);
		}
		
		// For now, only one indicator is allowed, so remove any existing ones before adding the new one.
		environmentalIndicators.get('indicators').length = 0;
		
		const kei = moddle.create('bpmn4es:keyEnvironmentalIndicator', keiProperties);
		kei.$parent = environmentalIndicators;
		environmentalIndicators.get('indicators').push(kei);

		modeling.updateProperties(target, {
			extensionElements
		});
  };
}
