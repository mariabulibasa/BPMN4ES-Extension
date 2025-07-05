import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { openKeiDialog } from './KeiDialog';
import { KEI_SHORT_NAMES_EXPRESSION }  from '../KeiTypes';

export default class SequenceFlowContextPad {
  constructor(contextPad, modeling) {
    this.contextPad = contextPad;
    this.modeling = modeling;

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    // Only show the custom menu on sequence flows coming out of XOR gateways
    if (
      element.type === 'bpmn:SequenceFlow' &&
      element.source &&
      element.source.type === 'bpmn:ExclusiveGateway'
    ) {
      return {
        'leaf-menu': {
          group: 'edit',
          className: 'kei-icon kei-icon-leaf',
          title: 'Configure KEI condition…',
          action: {
            click: (_, sequenceFlowElement) =>
              this._openKEIPopup(sequenceFlowElement)
          }
        }
      };
    }

    return {};
  }

  _openKEIPopup(sequenceFlowElement) {
    const sequenceFlowBO = getBusinessObject(sequenceFlowElement);
    const gatewayBO = sequenceFlowBO.sourceRef;

    // Recursively collect all upstream tasks that have KEI indicators attached
    const visitedElements = new Set();  // used to prevent cycles
    const keiTaskMap = new Map();       // collect tasks with KEI indicators

    // Check if a task has a KEI extension attached
    function hasKEIExtension(elementBO) {
      const extensions = elementBO.extensionElements;
      if (!extensions) return false;

      const values = extensions.get ? extensions.get('values') : extensions.values;
      return values && values.some(v =>
        v.$type === 'bpmn4es:environmentalIndicators' &&
        Array.isArray(v.indicators) &&
        v.indicators.length > 0
      );
    }

    // Recursively walk upstream from the gateway to find KEI tasks
    function traverseUpstream(elementBO) {
      if (!elementBO.incoming) return;

      elementBO.incoming.forEach(incomingFlow => {
        const sourceBO = incomingFlow.sourceRef;

        if (!visitedElements.has(sourceBO.id)) {
          visitedElements.add(sourceBO.id);

          // Add task to the map if it has KEI
          if ((sourceBO.$type === 'bpmn:Task' || sourceBO.$type === 'bpmn:SubProcess') && hasKEIExtension(sourceBO)) {
            keiTaskMap.set(sourceBO.id, sourceBO);
          }

          // Keep traversing further upstream
          traverseUpstream(sourceBO);
        }
      });
    }

    // Start from the XOR gateway
    traverseUpstream(gatewayBO);

    // Create a list of process variables for the dropdown (task names + KEI)
    const availableVariables = Array.from(keiTaskMap.values()).map(taskBO => {
      const taskName = (taskBO.name || taskBO.id).replace(/\s+/g, '');
      const keiExtension = taskBO.extensionElements.values.find(e =>
        e.$type === 'bpmn4es:environmentalIndicators');
      const kei = keiExtension?.indicators?.[0];
      const keiId = kei?.id || 'unknown';
      const keiShort = KEI_SHORT_NAMES_EXPRESSION[keiId] || keiId;

      return {
        id: taskBO.id,
        label: `${taskName}_${keiShort}`,
        keiId
      };
    });

    // Open the dialog and update the sequence flow upon confirmation
    openKeiDialog(availableVariables, (expression) => {
      this.modeling.updateProperties(sequenceFlowElement, {
        name: expression,
        conditionExpression: {
          'xsi:type': 'bpmn:tFormalExpression',
          body: expression
        }
      });
    });
  }
}

SequenceFlowContextPad.$inject = ['contextPad', 'modeling'];
