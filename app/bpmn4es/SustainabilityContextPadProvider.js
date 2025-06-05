import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import { getStartPosition } from './util.js';

export default class SustainabilityContextPadProvider {
  constructor(config, contextPad, create, elementFactory, injector, translate, popupMenu) {
    this._create = create;
    this._elementFactory = elementFactory;
    this._contextPad = contextPad;
    this._translate = translate;
    this._popupMenu = popupMenu;

    if (config.autoPlace !== false) {
      this._autoPlace = injector.get('autoPlace', false);
    }

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    if (isAny(element, [ 'bpmn:IntermediateThrowEvent' ])) {
      const translate = this._translate;
      const contextPad = this._contextPad;
      const popupMenu = this._popupMenu;

      return {
        'add.sustainability-start': {
          group: 'sustainability',
          className: 'kei-icon kei-icon-leaf',
          title: translate('Choose sustainability start event'),
          action: {
            click: (event, element) => {
              const position = {
                ...getStartPosition(contextPad, element),
                cursor: {
                  x: event.x,
                  y: event.y
                }
              };
              popupMenu.open(element, 'sustainability-start-selector', position);
            }
          }
        }
      };
    }

    return {};
  }
}

SustainabilityContextPadProvider.$inject = [
  'config',
  'contextPad',
  'create',
  'elementFactory',
  'injector',
  'translate',
  'popupMenu'
];
