// components/VesselLayer.jsx
import React, { useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import { useVesselData } from '../../../hooks/useVesseldata';
import VesselPopup from '../../popups/vessel/VesselPopup';

const emptyGeoJSON = {
  type: 'FeatureCollection',
  features: [],
};

const VesselLayer = ({ map, selectedRange, visible = true }) => {
  const { vessels, loading, error } = useVesselData(selectedRange);

  // Initialize the source and layer
  const initializeSourceAndLayer = useCallback(() => {
    console.log('Initializing source and layer, map ready:', !!map);
    if (!map) return;

    // Add the vessel icon image if not already added
    if (!map.hasImage('vessel-icon')) {
      console.log('Adding vessel icon');
      const vesselIcon = new Image();
      vesselIcon.onload = () => {
        if (!map.hasImage('vessel-icon')) {
          map.addImage('vessel-icon', vesselIcon);
          console.log('Vessel icon added');
          setupSourceAndLayer();
        }
      };
      vesselIcon.src =
        'data:image/svg+xml;utf8,' +
        encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24"
               xmlns="http://www.w3.org/2000/svg">
            <polygon
              points="12,2 2,22 12,18 22,22"
              fill="white"
              stroke="rgba(34, 0, 67, 0.95)"
            />
          </svg>
        `);
    } else {
      setupSourceAndLayer();
    }
  }, [map]);

  const setupSourceAndLayer = () => {
    console.log('Setting up source and layer');
    try {
      // Remove existing source and layer if they exist
      if (map.getLayer('vessels')) {
        map.removeLayer('vessels');
      }
      if (map.getSource('vessels')) {
        map.removeSource('vessels');
      }

      // Add source
      map.addSource('vessels', {
        type: 'geojson',
        data: emptyGeoJSON,
      });

      // Add layer
      map.addLayer({
        id: 'vessels',
        type: 'symbol',
        source: 'vessels',
        layout: {
          'icon-image': 'vessel-icon',
          'icon-allow-overlap': true,
          'icon-size': 0.5,
          'icon-rotate': ['get', 'rotation'],
          'icon-rotation-alignment': 'map',
          'visibility': visible ? 'visible' : 'none',
        },
      });

      console.log('Source and layer added successfully');
    } catch (err) {
      console.error('Error setting up source and layer:', err);
    }
  };

  // Set up map event handlers
  useEffect(() => {
    if (!map) return;

    const setupEventHandlers = () => {
      map.on('click', 'vessels', (e) => {
        if (!e.features?.[0]) return;
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        const popupNode = document.createElement('div');
        const root = createRoot(popupNode);
        root.render(<VesselPopup properties={properties} />);

        const popup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: true,
          maxWidth: '300px',
        })
          .setLngLat(coordinates)
          .setDOMContent(popupNode)
          .addTo(map);

        popup.on('close', () => {
          root.unmount();
        });
      });

      map.on('mouseenter', 'vessels', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'vessels', () => {
        map.getCanvas().style.cursor = '';
      });
    };

    if (map.isStyleLoaded()) {
      console.log('Map style already loaded, initializing');
      initializeSourceAndLayer();
      setupEventHandlers();
    } else {
      console.log('Waiting for map style to load');
      map.once('style.load', () => {
        console.log('Map style loaded, initializing');
        initializeSourceAndLayer();
        setupEventHandlers();
      });
    }

    return () => {
      if (map.getLayer('vessels')) {
        map.removeLayer('vessels');
      }
      if (map.getSource('vessels')) {
        map.removeSource('vessels');
      }
    };
  }, [map, initializeSourceAndLayer]);

  // Update data when vessels change
  useEffect(() => {
    if (!map || !map.getSource('vessels')) {
      console.log('Map or source not ready yet');
      return;
    }

    console.log('Updating vessel data:', 
      'Loading:', loading, 
      'Vessel count:', vessels.length
    );

    const newData = vessels.length > 0
      ? {
          type: 'FeatureCollection',
          features: vessels.map((vessel) => ({
            type: 'Feature',
            geometry: vessel.geometry,
            properties: {
              ...vessel.properties,
              rotation: vessel.properties.cog || 0,
            },
          })),
        }
      : emptyGeoJSON;

    try {
      map.getSource('vessels').setData(newData);
      console.log('Vessel data updated successfully');
    } catch (err) {
      console.error('Error updating vessel data:', err);
    }
  }, [map, vessels, loading]);

  // Handle visibility changes
  useEffect(() => {
    if (!map || !map.getLayer('vessels')) {
      console.log('Map or layer not ready for visibility change');
      return;
    }

    console.log('Setting vessel layer visibility:', visible);
    map.setLayoutProperty('vessels', 'visibility', visible ? 'visible' : 'none');
  }, [map, visible]);

  if (error) {
    console.error('Error loading vessel data:', error);
  }

  return null;
};

export default VesselLayer;