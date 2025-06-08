import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { getStartPosition, hasExtensionElement } from './util.js';

export default class KeiContextPad {
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
    const { _contextPad: contextPad, _translate: translate, _popupMenu: popupMenu } = this;

    // Only add the full KEI menu item for tasks, subprocesses and intermediate throw events
    if ( isAny(element, [ 'bpmn:Task', 'bpmn:SubProcess', 'bpmn:IntermediateThrowEvent' ]) ) {
      return makeEntry();

    // Only add the KEI menu for boundary events that are attached to KEI activities. 
    // In that case, the menu for the boundary event will only contain the same KEI that is attached to the activity, not the full KEI list.
    } else if ( isAny(element, [ 'bpmn:BoundaryEvent' ]) ) {
      const hostBusinessObject = element.host && getBusinessObject(element.host);
      if ( hostBusinessObject && hasExtensionElement(hostBusinessObject, 'bpmn4es:environmentalIndicators') ) {
        return makeEntry();
      }
    }

    return {};

    // Function for displaying the leaf menu
    function makeEntry() {
      return {
        'add.kei': {
          group: 'kei',
          className: 'kei-icon kei-icon-leaf',
          title: translate('Assign KEI'),
          action: {
            click: (event, element) => {
              const position = {
                ...getStartPosition(contextPad, element),
                cursor: { x: event.x, y: event.y }
              };
              popupMenu.open(element, 'kei-selector', position);
            }
          }
        }
      };
    }
  }
}

KeiContextPad.$inject = [
  'config',
  'contextPad',
  'create',
  'elementFactory',
  'injector',
  'translate',
  'popupMenu'
];
