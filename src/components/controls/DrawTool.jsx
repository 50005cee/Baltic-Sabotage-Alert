import React, { useEffect, useRef } from 'react';
import { MaplibreTerradrawControl } from '@watergis/maplibre-gl-terradraw';
import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css';

const DrawTool = ({ map, position = 'top-right' }) => {
  const drawRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Initialize the terra-draw control with all available modes
    const draw = new MaplibreTerradrawControl({
      modes: [
        'render',
        'point',
        'linestring',
        'polygon',
        'rectangle',
        'circle',
        'freehand',
        'angled-rectangle',
        'sensor',
        'sector',
        'select',
        'delete-selection',
        'delete',
        'download'
      ],
      open: false,
      // Additional styling options
      styles: {
        point: {
          'circle-color': '#ff4400',
          'circle-radius': 6
        },
        linestring: {
          'line-color': '#ff4400',
          'line-width': 2
        },
        polygon: {
          'fill-color': '#ff4400',
          'fill-opacity': 0.3,
          'line-color': '#ff4400',
          'line-width': 2
        }
      }
    });

    // Store the control reference
    drawRef.current = draw;

    // Add the control to the map
    map.addControl(draw, position);

    // Event listeners for drawing interactions
    map.on('terradraw.create', (e) => {
      console.log('Created feature:', e.detail);
    });

    map.on('terradraw.update', (e) => {
      console.log('Updated feature:', e.detail);
    });

    map.on('terradraw.delete', (e) => {
      console.log('Deleted feature:', e.detail);
    });

    map.on('terradraw.selectionchange', (e) => {
      console.log('Selection changed:', e.detail);
    });

    // Cleanup function
    return () => {
      if (map && drawRef.current) {
        map.removeControl(drawRef.current);
        // Remove event listeners
        map.off('terradraw.create');
        map.off('terradraw.update');
        map.off('terradraw.delete');
        map.off('terradraw.selectionchange');
      }
    };
  }, [map, position]);

  return null; // This is a headless component
};

export default DrawTool;