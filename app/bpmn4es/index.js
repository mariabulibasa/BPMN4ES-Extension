import KeiContextPad from './KeiContextPad';
import KeiRenderer from './KeiRenderer';
import KeiMenuProvider from './KeiMenuProvider';
import KeiEventRenderer from './KeiEventRenderer';
import ClearKEIOnReplace from './ClearKeiOnReplace';
import SequenceFlowContextPad from './SequenceFlowContextPad';
import KeiReplaceMenuProvider from './KeiReplaceMenuProvider';

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
