import React, { useState } from 'react';

const colorRamps = [
  { id: 'magma', name: 'Magma', preview: '#FF1F4B-#FB9F3A-#000004' },
  { id: 'viridis', name: 'Viridis', preview: '#FDE725-#21908C-#440154' },
  { id: 'cividis', name: 'Cividis', preview: '#FDE737-#1A6CA6-#00224E' },
  { id: 'greens', name: 'Greens', preview: '#E5F5E0-#31A354-#00441B' },
  { id: 'reds', name: 'Reds', preview: '#FEE0D2-#DE2D26-#67000D' },
  { id: 'turbo', name: 'Turbo', preview: '#23171B-#F4444F-#30123B' }
];

const LayerSettings = ({ isOpen, onClose, onApplySettings }) => {
  const [selectedRamp, setSelectedRamp] = useState('viridis');

  const handleApply = () => {
    onApplySettings({ colorRamp: selectedRamp });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-[300px] top-0 h-full flex items-center">
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 w-64 ml-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-sm font-medium">Layer Settings</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color Ramp
            </label>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {colorRamps.map((ramp) => (
                <div 
                  key={ramp.id}
                  className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 ${
                    selectedRamp === ramp.id ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => setSelectedRamp(ramp.id)}
                >
                  <div
                    className="w-24 h-4 rounded mr-2"
                    style={{
                      background: `linear-gradient(to right, ${ramp.preview.split('-').join(',')})`
                    }}
                  />
                  <span className="text-sm text-gray-300">{ramp.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleApply}
            className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayerSettings;