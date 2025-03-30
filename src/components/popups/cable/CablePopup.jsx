// src/components/CablePopup.jsx
import React from 'react';

const CablePopup = ({ properties }) => {
  return (
    <div className="cable-popup">
      <div className="cable-popup-header">
        <h3>Cable Info</h3>
      </div>
      <div className="cable-popup-content">
        <div className="cable-popup-row">
          <span className="cable-popup-label">Type:</span>
          <span className="cable-popup-value">{properties.Type || 'N/A'}</span>
        </div>
        <div className="cable-popup-row">
          <span className="cable-popup-label">Status:</span>
          <span className="cable-popup-value">{properties.Status || 'N/A'}</span>
        </div>
        <div className="cable-popup-row">
          <span className="cable-popup-label">Capacity:</span>
          <span className="cable-popup-value">
            {properties.Capacity
              ? `${properties.Capacity} ${properties.Unit}`
              : 'N/A'}
          </span>
        </div>
        <div className="cable-popup-row">
          <span className="cable-popup-label">Year:</span>
          <span className="cable-popup-value">{properties.Year || 'N/A'}</span>
        </div>
        <div className="cable-popup-row">
          <span className="cable-popup-label">Protection:</span>
          <span className="cable-popup-value">{properties.Cab_prot || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default CablePopup;
