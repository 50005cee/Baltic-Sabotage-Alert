// src/components/LayerManager.jsx
import React, { useState } from 'react';
// import LayerSettings from './LayerSettings';
import { Cog, Loader2 } from 'lucide-react';

const LayerGroup = ({ group, groupKey, onToggleLayer, onUpdateLayerSettings, loadingLayers = {}, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  // const [openSettingsId, setOpenSettingsId] = useState(null);
  const indent = level * 16;

  // const handleSettingsClick = (layerId, e) => {
  //   e.stopPropagation();
  //   setOpenSettingsId(openSettingsId === layerId ? null : layerId);
  // };

  const isWMSLayer = (layerId) => {
    return layerId.startsWith('density-');
  };

  return (
    <div className="layer-group" style={{ marginLeft: `${indent}px` }}>
      {groupKey && (
        <div 
          className="layer-group-header"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          <span className="group-name">{groupKey}</span>
        </div>
      )}
      
      {isExpanded && (
        <div className="layer-group-content">
          {Object.entries(group).map(([key, value]) => {
            if (typeof value === 'object' && !value.hasOwnProperty('visible')) {
              return (
                <LayerGroup
                  key={key}
                  groupKey={key}
                  group={value}
                  onToggleLayer={onToggleLayer}
                  onUpdateLayerSettings={onUpdateLayerSettings}
                  loadingLayers={loadingLayers}
                  level={level + 1}
                />
              );
            } else {
              return (
                <div 
                  key={key} 
                  className="layer-item relative"
                  style={{ marginLeft: '16px' }}
                >
                  <div className="flex items-center justify-between">
                    <label className="layer-toggle flex-1">
                      <input
                        type="checkbox"
                        checked={value.visible}
                        onChange={() => onToggleLayer(value.id)}
                        className="layer-checkbox"
                      />
                      <div className="flex items-center">
                        <span className="layer-name">{value.name}</span>
                        {loadingLayers[value.id] && (
                          <Loader2 className="loading-indicator ml-2" />
                        )}
                      </div>
                    </label>
                    
                    {/* Settings button commented out
                    {isWMSLayer(value.id) && (
                      <button
                        className="settings-button"
                        onClick={(e) => handleSettingsClick(value.id, e)}
                        title="Layer Settings"
                      >
                        <Cog className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                    )}
                    */}
                  </div>
                  
                  {/* Layer settings modal commented out
                  {openSettingsId === value.id && (
                    <LayerSettings
                      isOpen={true}
                      onClose={() => setOpenSettingsId(null)}
                      onApplySettings={(settings) => {
                        onUpdateLayerSettings(value.id, settings);
                        setOpenSettingsId(null);
                      }}
                    />
                  )}
                  */}
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
};

const LayerManager = ({ layers, onToggleLayer, onUpdateLayerSettings, loadingLayers }) => {
  return (
    <div className="layer-manager">
      <h3 className="layer-manager-title">Layers</h3>
      <div className="layer-list">
        <LayerGroup 
          group={layers} 
          onToggleLayer={onToggleLayer} 
          onUpdateLayerSettings={onUpdateLayerSettings}
          loadingLayers={loadingLayers}
        />
      </div>

      <style>{`
        .layer-manager {
          color: white;
          font-size: 14px;
        }

        .layer-manager-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .layer-group {
          margin-bottom: 8px;
        }

        .layer-group-header {
          cursor: pointer;
          padding: 4px 0;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
        }

        .layer-group-header:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .expand-icon {
          font-size: 10px;
          width: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .layer-item {
          padding: 4px 0;
        }

        .layer-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .settings-button {
          padding: 4px;
          border-radius: 4px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .settings-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .layer-checkbox {
          cursor: pointer;
        }

        .layer-name {
          user-select: none;
        }

        .layer-toggle:hover .layer-name {
          color: rgba(255, 255, 255, 0.8);
        }

        .loading-indicator {
          width: 14px;
          height: 14px;
          color: #60A5FA;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LayerManager;