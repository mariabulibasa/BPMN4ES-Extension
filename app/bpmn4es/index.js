import KeiContextPad from './tasks/KeiContextPad';
import KeiRenderer from './tasks/KeiRenderer';
import KeiMenuProvider from './tasks/KeiMenuProvider';
import KeiEventRenderer from './events/KeiEventRenderer';
import ClearKEIOnReplace from './ClearKeiOnReplace';
import SequenceFlowContextPad from './decisions/SequenceFlowContextPad';
import KeiReplaceMenuProvider from './events/KeiReplaceMenuProvider';

export default {
  __init__: [
    'keiContextPad',
    'keiRenderer',
    'keiMenuProvider',
    'keiEventRenderer',
    'clearKeiOnReplace',
    'sequenceFlowContextPad',
    'keiReplaceMenuProvider'
  ],
  keiContextPad:                        ['type', KeiContextPad],
  keiRenderer:                         ['type', KeiRenderer],
  keiMenuProvider:                     ['type', KeiMenuProvider],
  keiEventRenderer:                     ['type', KeiEventRenderer],
  clearKeiOnReplace:              ['type', ClearKEIOnReplace],
  sequenceFlowContextPad:     ['type', SequenceFlowContextPad],
  keiReplaceMenuProvider:   ['type', KeiReplaceMenuProvider]
};
