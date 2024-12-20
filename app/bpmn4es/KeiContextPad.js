import { assign } from 'min-dash';
import { is } from 'bpmn-js/lib/util/ModelUtil';

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
  	const businessObject = element.businessObject;
  	
		// Only add the KEI menu item for tasks and subprocesses.
		if ( is(businessObject, 'bpmn:Task') || is(businessObject, 'bpmn:SubProcess') ) {
		  const translate = this._translate;
			const contextPad = this._contextPad;
			const popupMenu = this._popupMenu;

			return {
				'add.kei': {
				  group: 'kei',
				  className: 'kei-icon kei-icon-leaf',
				  title: translate('Assign KEI'),
				  action: {
				    click: (event, element) => {
				      const position = {
				        ...getStartPosition(contextPad, element),
				        cursor: {
				          x: event.x,
				          y: event.y
				        }
				      };
				      popupMenu.open(element, 'kei-selector', position);
				    }
				  }
				}
			};
		} else {
			return {};
		}
	}
}

function getStartPosition(contextPad, elements) {
  const Y_OFFSET = 5;

  const pad = contextPad.getPad(elements).html;

  const padRect = pad.getBoundingClientRect();

  return {
    x: padRect.left,
    y: padRect.bottom + Y_OFFSET
  };
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
