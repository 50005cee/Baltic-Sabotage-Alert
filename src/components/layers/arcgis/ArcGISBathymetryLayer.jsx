// src/components/ArcGISBathymetryLayer.jsx
import React, { useEffect, useRef, useState } from 'react';

const ArcGISBathymetryLayer = ({
  map,
  layerId = 'bsbd',
  visible = true,
  onLoadingChange
}) => {
  const sourceId = `source-${layerId}`;
  const layerAdded = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  const initializeLayer = () => {
    if (!map) return;

    try {
      if (!map.getSource(sourceId)) {
        // Construct the tile URL template
        const params = new URLSearchParams({
          dpi: 96,
          transparent: true,
          format: 'png32',
          layers: 'show:16',
          bboxSR: 3857,
          imageSR: 3857,
          size: '256,256',
          f: 'image'
        });

        const tileUrl = `https://maps.helcom.fi/arcgis/rest/services/MADS/Background/MapServer/export?${params.toString()}&bbox={bbox-epsg-3857}`;

        map.addSource(sourceId, {
          type: 'raster',
          tiles: [tileUrl],
          tileSize: 256,
          attribution: '© HELCOM Bathymetry Database'
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

        map.addLayer({
          id: layerId,
          type: 'raster',
          source: sourceId,
          layout: {
            visibility: visible ? 'visible' : 'none'
          },
          paint: {
            'raster-opacity': 0.7,
            'raster-resampling': 'linear',
            'raster-fade-duration': 0
          }
        }, firstSymbolId);

        layerAdded.current = true;
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    } catch (error) {
      console.error('Error initializing bathymetry layer:', error);
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  useEffect(() => {
    if (!map) return;

    setIsLoading(true);
    onLoadingChange?.(true);

    if (map.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.once('style.load', initializeLayer);
    }

    const handleStyleData = () => {
      if (!map.getLayer(layerId)) {
        layerAdded.current = false;
      }
      if (!layerAdded.current) {
        initializeLayer();
      }
    };

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
  }, [map]);

  useEffect(() => {
    if (!map || !map.getLayer(layerId)) return;
    const visibility = visible ? 'visible' : 'none';
    map.setLayoutProperty(layerId, 'visibility', visibility);
  }, [visible, map, layerId]);

  return null;
};

export default ArcGISBathymetryLayer;