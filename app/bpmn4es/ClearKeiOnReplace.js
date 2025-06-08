import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

export default function ClearKeiOnReplace(eventBus, modeling) {
  // listen for the shape.replace command having completed
  eventBus.on('commandStack.shape.replace.postExecute', 2000, (evt) => {
    const { context } = evt;
    const newShape = context.newShape;

    // Only for elements where KEIs are rendered
    if ( isAny(newShape, [ 'bpmn:BoundaryEvent', 'bpmn:IntermediateThrowEvent', 'bpmn:Task', 'bpmn:Subprocess' ]) ) {

      const bo = getBusinessObject(newShape),
            ext = bo.extensionElements;

      if ( ext ) {
        // wipe out all extensions (so old environmentalIndicators go away)
        modeling.updateProperties(newShape, {
          extensionElements: undefined
        });
      }
    }
  });
}

ClearKeiOnReplace.$inject = [ 'eventBus', 'modeling' ];
