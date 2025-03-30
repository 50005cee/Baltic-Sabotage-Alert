import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';

const AreaOfInterestLayer = ({
  map,
  layerId = 'area-of-interest-layer',
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
        '/data/area-of-interest.geojson',
        './data/area-of-interest.geojson',
        '../data/area-of-interest.geojson',
        '/Baltic-Sabotage-Alert/data/area-of-interest.geojson'
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
        throw new Error('Failed to load area of interest data from any known location');
      }
      
      console.log('Successfully loaded area of interest from:', successfulPath);
      const geojson = await response.json();
      
      // Validate GeoJSON structure
      if (!geojson.type || geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
        throw new Error('Invalid GeoJSON format');
      }
      
      setGeoJsonData(geojson);
      return geojson;
    } catch (error) {
      console.error('Error fetching area of interest features:', error);
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
        let beforeLayerId;
        // Find the first historical averages layer or density layer
        for (const layer of map.getStyle().layers) {
          if (layer.id.includes('historical-') || layer.id.includes('density-')) {
            beforeLayerId = layer.id;
            break;
          }
        }

        map.addLayer(
          {
            id: layerId,
            type: 'fill',
            source: sourceId,
            layout: {
              visibility: visible ? 'visible' : 'none'
            },
            paint: {
              'fill-color': '#b01465',
              'fill-opacity': 0.6
            }
          },
          beforeLayerId
        );

        layerAdded.current = true;
      }
    } catch (error) {
      console.error('Error initializing area of interest layer:', error);
      setError(error.message);
    }
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

  if (error) {
    console.warn('Area of interest layer error:', error);
  }

  return null;
};

export default AreaOfInterestLayer;