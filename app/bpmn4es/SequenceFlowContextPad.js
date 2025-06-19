import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

export default class SequenceFlowContextPad {
  constructor(contextPad, modeling) {
    this.contextPad = contextPad;
    this.modeling   = modeling;

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    // Only show the custom menu on sequence flows coming from XOR gateways
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
            click: (_, sequenceFlowElement) => this._openKEIPopup(sequenceFlowElement)
          }
        }
      };
    }

    return {};
  }

  _openKEIPopup(sequenceFlowElement) {
    const sequenceFlowBO = getBusinessObject(sequenceFlowElement);
    const gatewayBO = sequenceFlowBO.sourceRef;

    // Recursively collect all upstream tasks with KEI indicators 
    const visitedElements = new Set();  // used to prevent cycles
    const keiTaskMap = new Map();       // collect tasks with KEI indicators

    const KEI_SHORT_NAMES = {
      'carbon-emissions': 'CO2',
      'renewable-energy': 'RenewEnergy',
      'energy-consumption': 'EnergyConsumption',
      'transportation-energy': 'TransportEnergy',
      'recyclable-waste': 'RecycleWaste',
      'water-waste': 'WaterConsumption',
      'battery-charging-full': 'Battery'
    };

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

    // Recursively walk upstream from the gateway
    function traverseUpstream(elementBO) {
      if (!elementBO.incoming) return;

      elementBO.incoming.forEach(incomingFlow => {
        const sourceBO = incomingFlow.sourceRef;

        if (!visitedElements.has(sourceBO.id)) {
          visitedElements.add(sourceBO.id);

          // Add task to the map if it has KEI indicators
          if (sourceBO.$type === 'bpmn:Task' && hasKEIExtension(sourceBO)) {
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
      const keiExtension = taskBO.extensionElements.values.find(e => e.$type === 'bpmn4es:environmentalIndicators');
      const kei = keiExtension?.indicators?.[0];
      const keiId = kei?.id || 'unknown';
      const keiShort = KEI_SHORT_NAMES[keiId] || keiId;
      return {
        id: taskBO.id,
        label: `${taskName}_${keiShort}`,
        keiId
      };
    });

    // Build and display the popup dialog 
    const dialog = document.createElement('div');
    dialog.className = 'leaf-dialog';
    dialog.innerHTML = `
      <div class="ld-header">Configure KEI condition</div>
      <div class="ld-body">
        <div class="ld-row">
          <label>Variable:
            <select id="ld-var">
              ${availableVariables.length
                ? availableVariables.map(v => `<option value="${v.id}">${v.label}</option>`).join('\n')
                : '<option disabled>(No KEI tasks found)</option>'}
            </select>
          </label>
        </div>
        <div class="ld-row">
          <label>Operator:
            <input id="ld-operator" type="text" placeholder="e.g. > or =="/>
          </label>
        </div>
        <div class="ld-row">
          <label>Value:
            <input id="ld-value" type="number" placeholder="e.g. 100"/>
          </label>
        </div>
      </div>
      <div class="ld-footer">
        <button id="ld-ok" disabled>OK</button>
        <button id="ld-cancel">Cancel</button>
      </div>
    `;
    document.body.appendChild(dialog);

    // Close the dialog if clicking outside of it 
    const handleOutsideClick = e => {
      if (!dialog.contains(e.target)) {
        closeDialog();
      }
    };
    // Delay event attachment so it doesn't instantly close
    setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 0);

    // Cancel button for closing the dialog
    dialog.querySelector('#ld-cancel').addEventListener('click', closeDialog);

    const operatorInput = dialog.querySelector('#ld-operator');
    const valueInput = dialog.querySelector('#ld-value');
    const okButton = dialog.querySelector('#ld-ok');

    // Enable OK button only when operator and value are filled 
    const updateOkButtonState = () => {
      okButton.disabled = !(operatorInput.value.trim() && valueInput.value.trim());
    };

    operatorInput.addEventListener('input', updateOkButtonState);
    valueInput.addEventListener('input', updateOkButtonState);

    // OK button writes the expression to the sequence flow 
    okButton.onclick = () => {
      const selectedId = dialog.querySelector('#ld-var').value;
      const selectedTask = availableVariables.find(v => v.id === selectedId);
      const op = operatorInput.value.trim();
      const val = valueInput.value.trim();
      const expression = `${selectedTask.label} ${op} ${val}`;

      // Update both the label and the runtime condition
      this.modeling.updateProperties(sequenceFlowElement, {
        name: expression,
        conditionExpression: {
          'xsi:type': 'bpmn:tFormalExpression',
          body: expression
        }
      });

      closeDialog();
    };

    // Remove the dialog and listener 
    function closeDialog() {
      document.body.removeChild(dialog);
      document.removeEventListener('mousedown', handleOutsideClick);
    }
  }
}

SequenceFlowContextPad.$inject = [
  'contextPad',
  'modeling'
];
