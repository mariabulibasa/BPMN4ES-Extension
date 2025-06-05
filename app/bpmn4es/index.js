import KeiContextPad from './KeiContextPad';
import KeiRenderer from './KeiRenderer';
import KeiMenuProvider from './KeiMenuProvider';
import SustainabilityContextPadProvider from './SustainabilityContextPadProvider';
import SustainabilityMenuProvider       from './SustainabilityMenuProvider';
import SustainabilityRenderer           from './SustainabilityRenderer';

export default {
  __init__: [
    'keiContextPad',
    'keiRenderer',
    'keiMenuProvider',
    'sustainabilityContextPadProvider',
    'sustainabilityMenuProvider',
    'sustainabilityRenderer'
  ],
  keiContextPad:                        ['type', KeiContextPad],
  keiRenderer:                         ['type', KeiRenderer],
  keiMenuProvider:                     ['type', KeiMenuProvider],
  sustainabilityContextPadProvider:    ['type', SustainabilityContextPadProvider],
  sustainabilityMenuProvider:          ['type', SustainabilityMenuProvider],
  sustainabilityRenderer:              ['type', SustainabilityRenderer]
};
