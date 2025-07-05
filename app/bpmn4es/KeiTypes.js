// Key environmental indicators that can be attached to the tasks
export const INDICATORS_TASKS = [
    {
        category: "energy",
        indicators: [
            {
                name: "Energy Consumption",
                id: "energy-consumption",
                icon_name: "bolt",
                unit: "kwh"
            },
      {
                name: "Renewable Energy",
                id: "renewable-energy",
                icon_name: "sunny",
                unit: "kwh"
            },
            {
                name: "Transportation Energy",
                id: "transportation-energy",
                icon_name: "local_shipping",
                unit: "kwh"
            },
      { name: 'Battery',               
        id: 'battery-charging-full', 
        icon_name: 'battery_charging_full', 
        unit: '%'
      }
        ]
    },
    {
        category: "emissions",
        indicators: [
            {
                name: "Carbon Emissions",
                id: "carbon-emissions",
                icon_name: "co2",
                unit: "kg"
            }
        ]
    },
  {
    category: "waste",
    indicators: [
      {
        name: "Recyclable Waste",
        id: "recyclable-waste",
        icon_name: "recycling",
        unit: "kg"
      }
    ]
  },
  {
    category: 'water',
    indicators: [
      { name: 'Water Consumption',     
        id: 'water-waste',           
        icon_name: 'water_drop',            
        unit: 'liters',
      }
    ]
  }
];

// Key environmental indicators that can be attached to the events
export const INDICATORS_EVENTS = [
  {
    category: 'energy',
    indicators: [
      { name: 'Energy Consumption',    
        id: 'energy-consumption',    
        icon_name: 'bolt',                  
        unit: 'kwh',
        allowedTypes: ['bpmn:StartEvent', 'bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent'] 
      },
      { name: 'Renewable Energy',      
        id: 'renewable-energy',      
        icon_name: 'sunny',                 
        unit: 'kwh', 
        allowedTypes: ['bpmn:StartEvent', 'bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent'] 
      },
      { name: 'Transportation Energy', 
        id: 'transportation-energy', 
        icon_name: 'local_shipping',        
        unit: 'kwh',
        allowedTypes: ['bpmn:StartEvent', 'bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent']
      },
      { name: 'Battery',               
        id: 'battery-charging-full', 
        icon_name: 'battery_charging_full', 
        unit: '%',
        allowedTypes: ['bpmn:StartEvent', 'bpmn:EndEvent', 'bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent']
      }
    ]
  },
  {
    category: 'emissions',
    indicators: [
      { name: 'Carbon Emissions',      
        id: 'carbon-emissions',      
        icon_name: 'co2',                   
        unit: 'kg',
        allowedTypes: ['bpmn:StartEvent', 'bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent']
      }
    ]
  },
  {
    category: 'waste',
    indicators: [
      { name: 'Recyclable Waste',      
        id: 'recyclable-waste',      
        icon_name: 'recycling',             
        unit: 'kg',
        allowedTypes: ['bpmn:StartEvent', 'bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent']
      }
    ]
  },
  {
    category: 'water',
    indicators: [
      { name: 'Water Consumption',     
        id: 'water-waste',           
        icon_name: 'water_drop',            
        unit: 'liters',
        allowedTypes: ['bpmn:StartEvent', 'bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent']
      }
    ]
  }
];

// Key environmental indicators shorter names to be attached to the process vaiables on the decision expressions  
export const KEI_SHORT_NAMES_EXPRESSION = {
  'carbon-emissions': 'CO2',
  'renewable-energy': 'RenewEnergy',
  'energy-consumption': 'EnergyConsumption',
  'transportation-energy': 'TransportEnergy',
  'recyclable-waste': 'RecycleWaste',
  'water-waste': 'WaterConsumption',
  'battery-charging-full': 'Battery'
};

