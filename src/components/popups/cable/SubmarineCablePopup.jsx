// src/components/SubmarineCablePopup.jsx
import React from 'react';

const SubmarineCablePopup = ({ properties }) => {
  return (
    <div className="submarine-cable-popup">
      <div className="submarine-cable-popup-header">
        <h3>Submarine Cable Info</h3>
      </div>
      <div className="submarine-cable-popup-content">
        <div className="submarine-cable-popup-row">
          <span className="submarine-cable-popup-label">Length:</span>
          <span className="submarine-cable-popup-value">{properties.length || 'N/A'}</span>
        </div>
        <div className="submarine-cable-popup-row">
          <span className="submarine-cable-popup-label">Owners:</span>
          <span className="submarine-cable-popup-value">
            {Array.isArray(properties.owners)
              ? properties.owners.join(', ')
              : properties.owners || 'N/A'}
          </span>
        </div>
        <div className="submarine-cable-popup-row">
          <span className="submarine-cable-popup-label">Cable ID:</span>
          <span className="submarine-cable-popup-value">{properties.id || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default SubmarineCablePopup;
