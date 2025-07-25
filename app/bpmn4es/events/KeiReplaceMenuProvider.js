import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { getExtensionElement } from '../util.js';
import { INDICATORS_EVENTS } from '../KeiTypes.js';

export default function KeiReplaceMenuProvider(
  popupMenu,
  translate,
  modeling,
  moddle,
  eventBus,
  elementRegistry,
  bpmnReplace,
  graphicsFactory
) {
  this._popupMenu = popupMenu;
  this._translate = translate;
  this._modeling = modeling;
  this._moddle = moddle;
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._bpmnReplace = bpmnReplace;
  this._graphicsFactory = graphicsFactory;

  popupMenu.registerProvider('bpmn-replace', this);
}

KeiReplaceMenuProvider.$inject = [
  'popupMenu',
  'translate',
  'modeling',
  'moddle',
  'eventBus',
  'elementRegistry',
  'bpmnReplace',
  'graphicsFactory'
];

// Main logic for determining which KEI options should appear in the context menu
KeiReplaceMenuProvider.prototype.getEntries = function(element) {
  const type = element.type;

  // Get all indicators with their category and filter by allowed types
  const allowedIndicators = INDICATORS_EVENTS
    .flatMap(cat => cat.indicators.map(indicator => ({
      ...indicator,
      category: cat.category
    })))
    .filter(ind => !ind.allowedTypes || ind.allowedTypes.includes(type));

  if (allowedIndicators.length === 0) return [];

  // BoundaryEvent KEI must match host's KEI
  if (type === 'bpmn:BoundaryEvent') {
    const hostBo = element.host && getBusinessObject(element.host);
  const hostEnv = getExtensionElement(hostBo, 'bpmn4es:environmentalIndicators');
  const hostIndicators = hostEnv?.indicators || [];

  // If host has KEI attached then only allow that one as an option in the replace menu
  if (hostIndicators.length > 0) {
    const hostKEI = hostIndicators[0];
    const matching = allowedIndicators.find(ind => ind.id === hostKEI.id);
    if (!matching) return [];

    return [
      makeKeiEntry(this, element, matching, false), // Interrupting
      makeKeiEntry(this, element, matching, true)   // Non-Interrupting
    ];
  }

  // If host has no KEI then allow all indicators
  return allowedIndicators.flatMap(indicator => [
    makeKeiEntry(this, element, indicator, false), // Interrupting
    makeKeiEntry(this, element, indicator, true)   // Non-Interrupting
  ]);
}

  // For intermediate events apply throw/catch modes
  if (type === 'bpmn:IntermediateThrowEvent' || type === 'bpmn:IntermediateCatchEvent') {
    return allowedIndicators.flatMap(indicator => [
      makeKeiEntry(this, element, indicator, 'throw'),
      makeKeiEntry(this, element, indicator, 'catch')
    ]);
  }

  // For start or end events there should be no additional text in the menu
  if (type === 'bpmn:StartEvent' || type === 'bpmn:EndEvent') {
    return allowedIndicators.map(indicator => makeKeiEntry(this, element, indicator, null));
  }

  return [];
};

function makeKeiEntry(ctx, element, indicator, mode) {
  let suffix = '';
  if (mode === 'throw') suffix = ' (Throw Event)';
  else if (mode === 'catch') suffix = ' (Catch Event)';
  else if (mode === false) suffix = ' (Interrupting)';
  else if (mode === true)  suffix = ' (Non-Interrupting)';

  const modeClass = (mode === 'throw') ? 'throw' : '';

  return {
    id: `kei-icon${indicator.id} ${mode ?? 'default'}`,
    label: ctx._translate(indicator.name + suffix),
    title: ctx._translate(indicator.name + suffix),
    group: indicator.category,
    className: `kei-icon ${modeClass} kei-icon-${indicator.id}`,
    action: createKeiAction(ctx, element, indicator, mode)
  };
}

// Action that gets triggered when a KEI menu entry is clicked 
function createKeiAction(ctx, element, indicator, mode) {
  return function () {
    let newType = null;
    if (mode === 'throw' && element.type !== 'bpmn:IntermediateThrowEvent') {
      newType = 'bpmn:IntermediateThrowEvent';
    }
    if (mode === 'catch' && element.type !== 'bpmn:IntermediateCatchEvent') {
      newType = 'bpmn:IntermediateCatchEvent';
    }

    const updateIndicator = (target) => {

      const bo = getBusinessObject(target);
      const ext = bo.extensionElements || ctx._moddle.create('bpmn:ExtensionElements');
      let env = getExtensionElement(bo, 'bpmn4es:environmentalIndicators');

      if (!env) {
        env = ctx._moddle.create('bpmn4es:environmentalIndicators');
        env.$parent = bo;
        ext.get('values').push(env);
      }

      env.get('indicators').length = 0;

      const props = {
        id: indicator.id,
        unit: indicator.unit,
        icon: indicator.icon_name
      };

      const keiEl = ctx._moddle.create('bpmn4es:keyEnvironmentalIndicator', props);
      keiEl.$parent = env;
      env.get('indicators').push(keiEl);

      // Update BPMN element properties
      const propsToUpdate = {
        extensionElements: ext,
        eventDefinitions: []
      };

      // For boundary events, control whether it's interrupting
      if (mode === true || mode === false) {
        propsToUpdate.cancelActivity = !mode;
      }

      ctx._modeling.updateProperties(target, propsToUpdate);

      // Force redraw of the shape to apply new styles
      const gfx = ctx._elementRegistry.getGraphics(target);
      ctx._eventBus.fire('render.shape', { element: target, gfx });
    };

    // If type replacement is needed, do it before updating the indicator
    if (newType) {
      const replaced = ctx._bpmnReplace.replaceElement(element, { type: newType });
      setTimeout(() => updateIndicator(replaced), 0); // defer update to ensure replaced element is ready
    } else {
      updateIndicator(element);
    }
  };
}