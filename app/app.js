import BpmnModeler from 'bpmn-js/lib/Modeler';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import diagramXML from '../resources/diagram.bpmn';
import bpmn4esModule from './bpmn4es';
import bpmn4esExtension from '../resources/sm';
import { saveAs } from 'file-saver';

const HIGH_PRIORITY = 1500;

const modeler = new BpmnModeler({
  container: '#container',
  additionalModules: [
    bpmn4esModule
  ],
  moddleExtensions: {
    bpmn4es: bpmn4esExtension
  }
});

async function openDiagram(xml) { 
	try {
    await modeler.importXML(xml);
    console.log('Diagram imported successfully');
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const containerEl = document.getElementById('container');
  const saveButtonEl = document.getElementById('save-button');
  let currentElement, businessObject;
  
  openDiagram(diagramXML);

  document.getElementById('save-button').addEventListener('click', (e) => {
    e.preventDefault();
    modeler.saveXML({ format: true }).then(result => {
      const blob = new Blob([result.xml], { type: 'application/xml' });
      saveAs(blob, 'diagram.bpmn');
    }).catch(err => console.error(err));
  });

  // Open sustainability metrics if user right clicks on element
  /*modeler.on('element.contextmenu', HIGH_PRIORITY, (event) => {
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();

    currentElement = event.element;

    // Ignore root element
    if (!currentElement.parent) {
      return;
    }

    businessObject = getBusinessObject(currentElement);
  });*/

  function getBusinessObject(element) {
    return element.businessObject || element;
  }
});
