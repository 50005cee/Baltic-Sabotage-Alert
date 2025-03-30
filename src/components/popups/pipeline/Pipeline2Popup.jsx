import React from 'react';

const PipelinePopup = ({ properties }) => {
  const formatLength = (length) => {
    if (!length) return 'N/A';
    const lengthInKm = length / 1000;
    return `${lengthInKm.toFixed(2)} km`;
  };

  return (
    <div className="pipeline-popup">
      <div className="pipeline-popup-header">
        <h3>Pipeline Information</h3>
      </div>
      <div className="pipeline-popup-content">
        <div className="pipeline-popup-row">
          <span className="pipeline-popup-label">Name:</span>
          <span className="pipeline-popup-value">{properties.Name || 'N/A'}</span>
        </div>
        <div className="pipeline-popup-row">
          <span className="pipeline-popup-label">Type:</span>
          <span className="pipeline-popup-value">{properties.Type || 'N/A'}</span>
        </div>
        <div className="pipeline-popup-row">
          <span className="pipeline-popup-label">Length:</span>
          <span className="pipeline-popup-value">{formatLength(properties.Shape_Length)}</span>
        </div>
      </div>
    </div>
  );
};

export default PipelinePopup;