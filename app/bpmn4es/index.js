import ReplaceMenuProvider from 'bpmn-js/lib/features/popup-menu/ReplaceMenuProvider';
import KeiContextPad from './KeiContextPad';
import KeiRenderer from './KeiRenderer';
import KeiMenuProvider from './KeiMenuProvider';
import SustainabilityReplaceMenuProvider from './SustainabilityReplaceMenuProvider';
import SustainabilityEventSelectorProvider from './SustainabilityEventSelectorProvider';
import SustainabilityRenderer from './SustainabilityRenderer';


export default {
  __init__: [
    'keiContextPad',
    'keiRenderer',
    'keiMenuProvider',
    'sustainabilityReplaceMenuProvider',
    'sustainabilityEventSelectorProvider',
    'sustainabilityRenderer',
    'replaceMenuProvider'
  ],
  keiContextPad: ['type', KeiContextPad],
  keiRenderer: ['type', KeiRenderer],
  keiMenuProvider: ['type', KeiMenuProvider],
  sustainabilityReplaceMenuProvider: ['type', SustainabilityReplaceMenuProvider],
  replaceMenuProvider: ['type', ReplaceMenuProvider],
  sustainabilityEventSelectorProvider: ['type', SustainabilityEventSelectorProvider],
  sustainabilityRenderer: ['type', SustainabilityRenderer]
};
