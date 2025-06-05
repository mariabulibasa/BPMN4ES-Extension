/**
 * SustainabilityMenuProvider.js
 * Updated to include icons before labels in the popup entries, just like KeiMenuProvider.
 */
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { getExtensionElement } from './util.js';

const INDICATORS = [
  {
    category: 'emissions',
    indicators: [
      {
        name: 'Carbon Emissions',
        id: 'carbon-emissions',
        icon_name: 'co2',
        unit: 'kg'
      }
    ]
  },
  {
    category: 'waste',
    indicators: [
      {
        name: 'Water Waste',
        id: 'water-waste',
        icon_name: 'water_drop',
        unit: 'liters'
      }
    ]
  }
];

export default function SustainabilityMenuProvider(popupMenu, modeling, moddle, translate) {
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._moddle = moddle;
  this._translate = translate;
  this._indicators = INDICATORS;

  popupMenu.registerProvider('sustainability-start-selector', this);
}

SustainabilityMenuProvider.$inject = [
  'popupMenu',
  'modeling',
  'moddle',
  'translate'
];

SustainabilityMenuProvider.prototype.getEntries = function (element) {
  const self = this;

  const entries = self._indicators.flatMap(category => {
    return category.indicators.map(indicator => {
      return {
        id: indicator.id,
        label: self._translate(indicator.name),
        className: 'sustainability-icon sustainability-icon-' + indicator.id,
        title: self._translate(indicator.name),
        group: category.category,
        action: function () {
          const targetValue = prompt(`Enter target value for ${indicator.name} (leave empty if only monitored):`);
          const enforced = !isNaN(parseFloat(targetValue)) && Number(targetValue) == parseFloat(targetValue);

          const bo = getBusinessObject(element);
          const extensionElements = bo.extensionElements || self._moddle.create('bpmn:ExtensionElements');

          let environmentalIndicators = getExtensionElement(bo, 'bpmn4es:environmentalIndicators');

          if (!environmentalIndicators) {
            environmentalIndicators = self._moddle.create('bpmn4es:environmentalIndicators');
            environmentalIndicators.$parent = bo;
            extensionElements.get('values')?.push(environmentalIndicators) || (extensionElements.values = [environmentalIndicators]);
          }

          // Overwrite existing indicators
          environmentalIndicators.indicators = [];

          const keiProps = {
            id: indicator.id,
            icon: indicator.icon_name,
            unit: indicator.unit
          };

          if (enforced) {
            keiProps.targetValue = parseFloat(targetValue);
          }

          const kei = self._moddle.create('bpmn4es:keyEnvironmentalIndicator', keiProps);
          kei.$parent = environmentalIndicators;
          environmentalIndicators.indicators.push(kei);

          self._modeling.updateProperties(element, {
            extensionElements: extensionElements
          });
        }
      };
    });
  });

  return entries;
};
