import BpmnModeler from 'bpmn-js/lib/Modeler';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import diagramXML from '../resources/diagram.bpmn';
import bpmn4esModule from './bpmn4es';
import bpmn4esExtension from '../resources/sm';
import { saveAs } from 'file-saver';

const HIGH_PRIORITY = 1500;

document.addEventListener('DOMContentLoaded', () => {
  const containerEl = document.getElementById('container');
  const saveButtonEl = document.getElementById('save-button');
  let currentElement, businessObject;

  const bpmnModeler = new BpmnModeler({
    container: '#container',
    additionalModules: [
      bpmn4esModule
    ],
    moddleExtensions: {
      bpmn4es: bpmn4esExtension
    }
  });

  bpmnModeler.importXML(diagramXML, (err) => {
    if (err) {
      console.error('Failed to import diagram', err);
    } else {
      console.log('Diagram imported successfully');
    }
  });

  document.getElementById('save-button').addEventListener('click', (e) => {
    e.preventDefault();
    bpmnModeler.saveXML({ format: true }).then(result => {
      const blob = new Blob([result.xml], { type: 'application/xml' });
      saveAs(blob, 'diagram.bpmn');
    }).catch(err => console.error(err));
  });

  // Open sustainability metrics if user right clicks on element
  bpmnModeler.on('element.contextmenu', HIGH_PRIORITY, (event) => {
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();

    currentElement = event.element;

    // Ignore root element
    if (!currentElement.parent) {
      return;
    }

    businessObject = getBusinessObject(currentElement);
  });

  function getBusinessObject(element) {
    return element.businessObject || element;
  }
});
