// src/components/map/SidePanel.jsx
import React, { useState } from "react";
import LayerManager from "../controls/LayerManager";
import Auth from "../usermanagement/Auth";
import UserAccount from "../usermanagement/UserAccount";

const SidePanel = ({ 
  layers, 
  onToggleLayer, 
  onUpdateLayerSettings, 
  loadingLayers, 
  session,         // passed from App.jsx
  onAuthChange     // passed from App.jsx
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Compute if any layer is still loading:
  const anyLayerLoading = Object.values(loadingLayers || {}).some(val => val);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  return (
    <div className={`sidepanel ${isExpanded ? 'expanded' : 'minimized'}`}>
      {isExpanded ? (
        // Expanded panel: full content with a toggle button in the footer.
        <div 
          className="sidepanel-content" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            gap: '0.5rem',
            overflowX: 'hidden'
          }}
        >
          {/* Main content */}
          <div 
            className="layers-container" 
            style={{ 
              overflowY: 'auto', 
              flexGrow: 1, 
              paddingRight: '1rem'
            }}
          >
            <LayerManager 
              layers={layers} 
              onToggleLayer={onToggleLayer} 
              onUpdateLayerSettings={onUpdateLayerSettings}
              loadingLayers={loadingLayers}
            />
          </div>

          <hr style={{ margin: '0.3rem 0', borderColor: 'rgba(255,255,255,0.2)' }} />

          {/* Footer container with account info and toggle button */}
          <div 
            className="sidepanel-footer" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              paddingTop: '0.3rem'
            }}
          >
            <div className="sidepanel-account">
              {session ? (
                <UserAccount />
              ) : (
                <Auth onAuthChange={onAuthChange} allowGuest={true} />
              )}
            </div>

            <button 
              className="toggle-button" 
              onClick={() => setIsExpanded(false)}
              aria-label="Minimize panel"
            >
              ←
            </button>
          </div>
        </div>
      ) : (
        // When minimized, no expanded content is rendered.
        null
      )}

      {/* Icons container (visible when minimized) */}
      <div 
        className="sidepanel-icons" 
        onClick={handleExpand} 
        title="Expand panel"
      >
        {/* Layers Icon with conditional loading animation */}
        <div 
          className={`icon layers-icon ${anyLayerLoading ? 'loading' : ''}`}
          title="Layers"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M11.99 18.54L4.66 14.1 2 15.76l9.99 5.76L22 15.76l-2.66-1.66zM11.99 12.6L2 8.17 4.66 6.5 11.99 10l7.32-3.5 2.66 1.67z"/>
          </svg>
        </div>
        {/* User Icon */}
        <div className="icon user-icon">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
