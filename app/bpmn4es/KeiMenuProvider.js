import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { getExtensionElement } from './util.js';

const INDICATORS = [
  {
    category: 'energy',
    indicators: [
      { name: 'Energy Consumption',    id: 'energy-consumption',    icon_name: 'bolt',                  unit: 'kwh'},
      { name: 'Renewable Energy',      id: 'renewable-energy',      icon_name: 'sunny',                 unit: 'kwh'},
      { name: 'Transportation Energy', id: 'transportation-energy', icon_name: 'local_shipping',        unit: 'kwh'},
      { name: 'Battery',               id: 'battery-charging-full', icon_name: 'battery_charging_full', unit: '%'}
    ]
  },
  {
    category: 'emissions',
    indicators: [
      { name: 'Carbon Emissions',      id: 'carbon-emissions',      icon_name: 'co2',            unit: 'kg'     }
    ]
  },
  {
    category: 'waste',
    indicators: [
      { name: 'Recyclable Waste',      id: 'recyclable-waste',      icon_name: 'recycling',      unit: 'kg'     },
    ]
  },
  {
    category: 'water',
    indicators: [
      { name: 'Water Consumption',           id: 'water-waste',           icon_name: 'water_drop',     unit: 'liters' }
    ]
  }
];

export default function KeiMenuProvider(
  popupMenu,
  modeling,
  moddle,
  translate,
  eventBus,
  elementRegistry
) {
  this._popupMenu       = popupMenu;
  this._modeling        = modeling;
  this._moddle          = moddle;
  this._translate       = translate;
  this._eventBus        = eventBus;
  this._elementRegistry = elementRegistry;
  this._indicators      = INDICATORS;

  popupMenu.registerProvider('kei-selector', this);
}

KeiMenuProvider.$inject = [
  'popupMenu',
  'modeling',
  'moddle',
  'translate',
  'eventBus',
  'elementRegistry'
];

KeiMenuProvider.prototype.getEntries = function(target) {
  const bo = getBusinessObject(target);

  // For the Boundary Event show only the KEI that is attached to that activity (interrupting and non-interrupting type)
  if ( target.type === 'bpmn:BoundaryEvent' ) {
    const hostBo = getBusinessObject(target.host);
    const envInd = getExtensionElement(hostBo, 'bpmn4es:environmentalIndicators');
    const allowed = envInd?.indicators?.map(i => i.id) || [];

    return this._indicators
      .flatMap(cat => cat.indicators
        .filter(ind => allowed.includes(ind.id))
        .flatMap(ind => ([
          makeEntry(this, target, ind, /* nonInterrupting= */ false),
          makeEntry(this, target, ind, /* nonInterrupting= */ true)
        ]))
      );
  }

  // Otherwise show full KEI menu for tasks, subprocesses and Intermediate Throw events
  return this._indicators
    .flatMap(cat => cat.indicators
      .map(ind => makeEntry(this, target, ind, /* nonInterrupting= */ null))
    );
};


function makeEntry(ctx, target, indicator, nonInterrupting) {
  let suffix    = '';
  if (nonInterrupting === true)  suffix = ' (Non-Interrupting)';
  if (nonInterrupting === false) suffix = ' (Interrupting)';

  return {
    id: `${indicator.id}${nonInterrupting===null?'':(nonInterrupting?'-non':'-int')}`,
    group: indicator.category,
    title: ctx._translate(indicator.name + suffix),
    label: ctx._translate(indicator.name + suffix),
    className: `kei-icon kei-icon-${indicator.id}`,
    action: createAction(ctx, target, indicator, nonInterrupting)
  };
}


function createAction(ctx, target, indicator, nonInterrupting) {
  return function(event, entry) {

    const raw = prompt(`Enter target for ${indicator.name}${nonInterrupting===null?'':' ('+(nonInterrupting? 'Non-Interrupting':'Interrupting')+')' } (empty=monitor only)`);
    const num = parseFloat(raw);
    const hasValue = !isNaN(num) && raw.trim() !== '';

    const bo   = getBusinessObject(target);
    const ext  = bo.extensionElements || ctx._moddle.create('bpmn:ExtensionElements');
    let env    = getExtensionElement(bo, 'bpmn4es:environmentalIndicators');

    if (!env) {
      env = ctx._moddle.create('bpmn4es:environmentalIndicators');
      env.$parent = bo;
      ext.get('values').push(env);
    }

    env.get('indicators').length = 0;

    const props = {
      id:   indicator.id,
      unit: indicator.unit,
      icon: indicator.icon_name
    };
    if (hasValue) props.targetValue = num;

    const keiEl = ctx._moddle.create('bpmn4es:keyEnvironmentalIndicator', props);
    keiEl.$parent = env;
    env.get('indicators').push(keiEl);

    ctx._modeling.updateProperties(target, { extensionElements: ext });
    ctx._modeling.updateProperties(target, { eventDefinitions: [] });

    // If it is a boundary event apply interrupting or non-interrupting type
    if (nonInterrupting === true) {
      ctx._modeling.updateProperties(target, { cancelActivity: false });
    } else if (nonInterrupting === false) {
      ctx._modeling.updateProperties(target, { cancelActivity: true });
    }

    // Force redraw
    const gfx = ctx._elementRegistry.getGraphics(target);
    ctx._eventBus.fire('render.shape', { element: target, gfx });

    // Redraw attached boundaries if we're editing a task, in order for the error icon to be visible if the 
    // kei of the event differs from the kei of the task
    if (target.type === 'bpmn:Task' || target.type === 'bpmn:SubProcess') {
      const attached = target.attachers || [];
      attached.forEach(boundary => {
        const gfxBoundary = ctx._elementRegistry.getGraphics(boundary);
        ctx._eventBus.fire('render.shape', { element: boundary, gfx: gfxBoundary });
      });
    }
  };
}
