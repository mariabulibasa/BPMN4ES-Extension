// app/bpmn4es/SustainabilityReplaceMenuProvider.js

import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

export default function SustainabilityReplaceMenuProvider(
  popupMenu,
  translate,
  replaceMenuProvider
) {
  this._popupMenu = popupMenu;
  this._translate = translate;
  this._replaceMenuProvider = replaceMenuProvider;

  // Register this provider with the Replace menu
  popupMenu.registerProvider('bpmn-replace', this);
}

SustainabilityReplaceMenuProvider.$inject = [
  'popupMenu',
  'translate',
  'replaceMenuProvider'
];

SustainabilityReplaceMenuProvider.prototype.getPopupMenuEntries = function(target) {
  // Get the default Replace menu entries
  const originalEntries = this._replaceMenuProvider.getPopupMenuEntries(target) || {};

  const bo = target.businessObject;
  if (isAny(bo, [
      'bpmn:StartEvent',
      'bpmn:EndEvent',
      'bpmn:IntermediateCatchEvent',
      'bpmn:IntermediateThrowEvent',
      'bpmn:BoundaryEvent'
    ])) {
    // Add our custom Sustainability Event entry
    originalEntries['replace-with-sustainability-event'] = {
      id: 'replace-with-sustainability-event',
      label: this._translate('Sustainability event'),
      className: 'bpmn-icon-sustainability-event',
      action: {
        click: (event, element) => {
          // Open the sustainability selector menu
          const position = { x: event.x, y: event.y };
          this._popupMenu.open(element, 'sustainability-event-selector', position);
        }
      }
    };
  }

  return originalEntries;
};
