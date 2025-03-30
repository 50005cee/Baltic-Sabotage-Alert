// src/components/ArcGISPipelineLayer1.jsx
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { createRoot } from 'react-dom/client';
import Pipeline1Popup from '../../popups/pipeline/Pipeline1Popup';

const ArcGISPipelineLayer1 = ({
  map,
  layerId = 'pipeline1-layer',
  visible = true,
  onLoadingChange
}) => {
  const sourceId = `source-${layerId}`;
  const layerAdded = useRef(false);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFeatures = async () => {
    try {
      setIsLoading(true);
      onLoadingChange?.(true);

      // Endpoint for Helcom pipelines 1: MapServer/54
      const baseUrl = 'https://maps.helcom.fi/arcgis/rest/services/MADS/Pressures/MapServer/54';
      const queryParams = new URLSearchParams({
        f: 'geojson',
        outFields: '*',
        where: '1=1',
        geometryType: 'esriGeometryEnvelope'
      });

      const response = await fetch(`${baseUrl}/query?${queryParams}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const geojson = await response.json();
      setGeoJsonData(geojson);
      return geojson;
    } catch (error) {
      console.error('Error fetching Helcom pipelines 1:', error);
      return null;
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  // Initialize layer configuration
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
        // Insert below the first symbol layer
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
              'line-color': '#C8FF00',  // Changed from rgb(200, 255, 0) to hex color
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
      console.error('Error initializing Helcom pipelines 1 layer:', error);
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

    // Click handler
    map.on('click', layerId, (e) => {
      if (!e.features.length) return;
      const feature = e.features[0];
      const coordinates = e.lngLat;
      const properties = feature.properties;

      // Create a DOM node for React to render into
      const popupNode = document.createElement('div');
      const root = createRoot(popupNode);

      // Render your React popup
      root.render(<Pipeline1Popup properties={properties} />);

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
      // Check if the layer was removed during style change
      if (!map.getLayer(layerId)) {
        layerAdded.current = false;
      }

      // Reinitialize layer if needed
      if (!layerAdded.current) {
        initializeLayer();
      }
    };

    // Initialize when map is ready
    if (map.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.once('style.load', initializeLayer);
    }

    // Listen for style changes
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
    const visibilityVal = visible ? 'visible' : 'none';
    map.setLayoutProperty(layerId, 'visibility', visibilityVal);
  }, [visible, map, layerId]);

  return null;
};

export default ArcGISPipelineLayer1;
