import KeiContextPad from './KeiContextPad';
import KeiRenderer from './KeiRenderer';
import KeiMenuProvider from './KeiMenuProvider';
import KeiEventRenderer from './KeiEventRenderer';
import ClearKEIOnReplace          from './ClearKeiOnReplace';

export default {
  __init__: [
    'keiContextPad',
    'keiRenderer',
    'keiMenuProvider',
    'keiEventRenderer',
    'clearKeiOnReplace'
  ],
  keiContextPad:                        ['type', KeiContextPad],
  keiRenderer:                         ['type', KeiRenderer],
  keiMenuProvider:                     ['type', KeiMenuProvider],
  keiEventRenderer:                     ['type', KeiEventRenderer],
  clearKeiOnReplace:              ['type', ClearKEIOnReplace],
};
