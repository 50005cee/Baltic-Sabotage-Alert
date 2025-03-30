// src/components/controls/BasemapToggle.jsx
import React, { useState } from 'react';

const basemaps = [
  {
    id: 'osm-basemap',
    name: 'OpenStreetMap',
    preview: 'https://a.tile.openstreetmap.org/2/1/1.png',
  },
  {
    id: 'empty-basemap',
    name: 'No Basemap',
    preview:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1vcGFjaXR5PSIwLjUiPjxwYXR0ZXJuIGlkPSJjIiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+PHJlY3QgZmlsbD0iIzMzMyIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiLz48L3N2Zz4=',
  },
  {
    id: 'satellite-basemap',
    name: 'Satellite',
    preview:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/2/1/1',
  },
  {
    id: 'esri-gray-basemap',
    name: 'Esri Gray (dark)',
    preview:
      'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/2/1/1',
  },
];

const BasemapToggle = ({ map }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Set default basemap to "osm-basemap"
  const [currentBasemapId, setCurrentBasemapId] = useState('esri-gray-basemap');

  const handleBasemapClick = (basemapId) => {
    if (!map) return;

    // Hide all basemap layers by setting their visibility to "none"
    basemaps.forEach((b) => {
      map.setLayoutProperty(b.id, 'visibility', 'none');
    });

    // Show the selected basemap by setting its visibility to "visible"
    map.setLayoutProperty(basemapId, 'visibility', 'visible');

    setCurrentBasemapId(basemapId);
    setIsExpanded(false);
  };

  // Find the current basemap (for display purposes)
  const current = basemaps.find((b) => b.id === currentBasemapId);

  return (
    <div className="basemap-toggle-container">
      <div className="basemap-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="current-basemap">
          <img src={current.preview} alt={current.name} className="preview-image" />
          <span className="basemap-name">{current.name}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="basemap-list">
          {basemaps.map((basemap) => (
            <div
              key={basemap.id}
              className={`basemap-option ${basemap.id === currentBasemapId ? 'active' : ''}`}
              onClick={() => handleBasemapClick(basemap.id)}
            >
              <img src={basemap.preview} alt={basemap.name} className="preview-image" />
              <span className="basemap-name">{basemap.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BasemapToggle;
