// src/components/SubmarineCableLayer.jsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { createRoot } from 'react-dom/client';
import SubmarineCablePopup from '../../popups/cable/SubmarineCablePopup'; // If you created this component

const SubmarineCableLayer = ({
  map,
  layerId = 'submarine-cables-layer',
  visible = true,
  onLoadingChange
}) => {
  const sourceId = `source-${layerId}`;
  const layerAdded = useRef(false);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchFeatures = async () => {
    try {
      setIsLoading(true);
      onLoadingChange?.(true);
      setError(null);
      
      // Try multiple possible file locations
      const possiblePaths = [
        '/data/submarine-cables.geojson',
        './data/submarine-cables.geojson',
        '../data/submarine-cables.geojson',
        '/Baltic-Sabotage-Alert/data/submarine-cables.geojson'
      ];
      
      let response = null;
      let successfulPath = '';
      
      // Try each path until we find one that works
      for (const path of possiblePaths) {
        try {
          const result = await fetch(path);
          if (result.ok) {
            response = result;
            successfulPath = path;
            break;
          }
        } catch (err) {
          console.log(`Failed to fetch from ${path}:`, err);
          continue;
        }
      }
      
      if (!response) {
        throw new Error('Failed to load submarine cable data from any known location');
      }
      
      console.log('Successfully loaded submarine cables from:', successfulPath);
      const geojson = await response.json();
      
      // Validate GeoJSON structure
      if (!geojson.type || geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
        throw new Error('Invalid GeoJSON format');
      }
      
      setGeoJsonData(geojson);
      return geojson;
    } catch (error) {
      console.error('Error fetching submarine cable features:', error);
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  const initializeLayer = () => {
    if (!map || !geoJsonData) return;

    try {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: geoJsonData
        });
      }

      if (!map.getLayer(layerId)) {
        let firstSymbolId;
        for (const layer of map.getStyle().layers) {
          if (layer.type === 'symbol') {
            firstSymbolId = layer.id;
            break;
          }
        }

        map.addLayer(
          {
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              visibility: visible ? 'visible' : 'none',
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#008000',
              'line-width': 2,
              'line-opacity': 0.8
            }
          },
          firstSymbolId
        );

        // Add interactivity
        setupInteractivity();
        layerAdded.current = true;
      }
    } catch (error) {
      console.error('Error initializing submarine cable layer:', error);
      setError(error.message);
    }
  };

  // Setup layer interactivity
  const setupInteractivity = () => {
    map.on('mouseenter', layerId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('click', layerId, (e) => {
      if (!e.features.length) return;
      const feature = e.features[0];
      const coordinates = e.lngLat;
      const properties = feature.properties || {};

      // Create a DOM node for React to render into
      const popupNode = document.createElement('div');
      const root = createRoot(popupNode);

      // Render your React popup
      root.render(<SubmarineCablePopup properties={properties} />); // Use CablePopup if suitable

      // Create a maplibre popup, attach the DOM node
      const popup = new maplibregl.Popup()
        .setLngLat(coordinates)
        .setDOMContent(popupNode)
        .addTo(map);

      // Cleanup React tree when popup is closed
      popup.on('close', () => {
        root.unmount();
      });
    });
  };

  // Initial data fetch
  useEffect(() => {
    if (!map) return;
    fetchFeatures();
  }, [map]);

  // Handle style changes and layer initialization
  useEffect(() => {
    if (!map || !geoJsonData) return;

    const handleStyleData = () => {
      if (!map.getLayer(layerId)) {
        layerAdded.current = false;
      }
      if (!layerAdded.current) {
        initializeLayer();
      }
    };

    if (map.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.once('style.load', initializeLayer);
    }

    map.on('styledata', handleStyleData);

    return () => {
      map.off('styledata', handleStyleData);
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
      layerAdded.current = false;
    };
  }, [map, layerId, geoJsonData]);

  // Handle visibility changes
  useEffect(() => {
    if (!map || !map.getLayer(layerId)) return;
    map.setLayoutProperty(
      layerId,
      'visibility',
      visible ? 'visible' : 'none'
    );
  }, [visible, map, layerId]);

  // Display error message if loading fails
  if (error) {
    console.warn('Submarine cable layer error:', error);
  }

  return null;
};

export default SubmarineCableLayer;
