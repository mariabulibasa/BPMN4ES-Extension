import BpmnModeler from 'bpmn-js/lib/Modeler';
import diagramXML from '../resources/diagram.bpmn';
import bpmn4esModule from './bpmn4es';
import bpmn4esExtension from '../resources/bpmn4es.json';
import { saveAs } from 'file-saver';

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
  openDiagram(diagramXML);

  document.getElementById('save-button').addEventListener('click', (e) => {
    e.preventDefault();
    modeler.saveXML({ format: true }).then(result => {
      const blob = new Blob([result.xml], { type: 'application/xml' });
      saveAs(blob, 'diagram.bpmn');
    }).catch(err => console.error(err));
  });
});
