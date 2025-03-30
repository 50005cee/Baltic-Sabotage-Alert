// src/components/map/MapLibreMap.jsx
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { TimeRangeSelector } from '../controls/TimeRangeSelector';
import BasemapToggle from '../controls/BasemapToggle';
import DrawTool from '../controls/DrawTool'; // <-- Import DrawTool here
import VesselLayer from '../layers/vessel/VesselLayer';
import ArcGISCableLayer from '../layers/arcgis/ArcGISCableLayer';
import SubmarineCableLayer from '../layers/local/SubmarineCableLayer';
import ArcGISPipelineLayer1 from '../layers/arcgis/ArcGISPipelineLayer1';
import ArcGISPipelineLayer2 from '../layers/arcgis/ArcGISPipelineLayer2';
import AreaOfInterestLayer from '../layers/local/AreaOfInterestLayer';
import ArcGISContainerDensityLayer from '../layers/arcgis/ArcGISContainerDensityLayer';
import ArcGISBathymetryLayer from '../layers/arcgis/ArcGISBathymetryLayer';
import ArcGISAllShiptypeDensityLayer from '../layers/arcgis/ArcGISAllShiptypeDensityLayer';

// Define a single style that contains all basemap sources and layers
const baseStyle = {
  version: 8,
  name: 'Multi-Basemap-Style',
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors'
    },
    'satellite-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '© Esri'
    },
    'esri-gray-tiles': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: '© Esri'
    },
    'empty-tiles': {
      type: 'raster',
      tiles: [],
      tileSize: 256
    }
  },
  layers: [
    {
      id: 'osm-basemap',
      type: 'raster',
      source: 'osm-tiles',
      layout: {
        visibility: 'none'
      },
      paint: { 'raster-opacity': 1.0 }
    },
    {
      id: 'satellite-basemap',
      type: 'raster',
      source: 'satellite-tiles',
      layout: {
        visibility: 'none'
      },
      paint: { 'raster-opacity': 1.0 }
    },
    {
      id: 'esri-gray-basemap',
      type: 'raster',
      source: 'esri-gray-tiles',
      layout: {
        visibility: 'visible'
      },
      paint: { 'raster-opacity': 1.0 }
    },
    {
      id: 'empty-basemap',
      type: 'raster',
      source: 'empty-tiles',
      layout: {
        visibility: 'none'
      },
      paint: { 'raster-opacity': 0 }
    }
  ]
};

const findLayerById = (layerId, layerObj) => {
  for (const [_, value] of Object.entries(layerObj)) {
    if (value.id === layerId) {
      return value;
    } else if (typeof value === 'object') {
      const found = findLayerById(layerId, value);
      if (found) return found;
    }
  }
  return null;
};

const MapLibreMap = ({ layers, layerSettings, onLayerLoadingChange }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedRange, setSelectedRange] = useState('1h');

  // Determine visibility flags from the provided layers prop
  const vesselsVisible = findLayerById('vessels', layers)?.visible ?? true;
  const helcomCablesVisible = findLayerById('helcom', layers)?.visible ?? false;
  const submarineCablesVisible = findLayerById('submarinecables', layers)?.visible ?? false;
  const pipeline1Visible = findLayerById('pipeline1', layers)?.visible ?? false;
  const pipeline2Visible = findLayerById('pipeline2', layers)?.visible ?? false;
  const areaOfInterestVisible = findLayerById('area-of-interest', layers)?.visible ?? false;
  const containerDensityVisible = findLayerById('density-container', layers)?.visible ?? false;
  const allShiptypeDensityVisible = findLayerById('density-allshiptype', layers)?.visible ?? false;
  const bathymetryVisible = findLayerById('bsbd', layers)?.visible ?? false;

  useEffect(() => {
    if (!mapRef.current && mapContainer.current) {
      console.log('Initializing map');

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: baseStyle,
        center: [21.33363593514353, 59.24609386621712],
        zoom: 6,
        antialias: true
      });

      // Enable antialiasing and preserve drawing buffer
      const gl = map.getCanvas().getContext('webgl', {
        preserveDrawingBuffer: true,
        antialias: true
      });

      mapRef.current = map;

      map.on('load', () => {
        console.log('Map loaded and ready');
        setMapReady(true);
      });

      // Add error handling for map load
      map.on('error', (e) => {
        console.error('Map error:', e.error);
      });
    }

    return () => {
      if (mapRef.current) {
        console.log('Cleaning up map');
        mapRef.current.remove();
        mapRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  const handleRangeChange = (range) => {
    setSelectedRange(range.replace('h', ''));
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="map-container" />
      {mapReady && mapRef.current && (
        <>
          <VesselLayer 
            map={mapRef.current} 
            selectedRange={selectedRange} 
            visible={vesselsVisible} 
          />

          <ArcGISCableLayer
            map={mapRef.current}
            layerId="helcom-cables"
            visible={helcomCablesVisible}
            onLoadingChange={(isLoading) => onLayerLoadingChange('helcom', isLoading)}
          />

          <SubmarineCableLayer
            map={mapRef.current}
            layerId="submarine-cables-layer"
            visible={submarineCablesVisible}
            onLoadingChange={(isLoading) => onLayerLoadingChange('submarinecables', isLoading)}
          />

          <ArcGISPipelineLayer1
            map={mapRef.current}
            layerId="pipeline1-layer"
            visible={pipeline1Visible}
            onLoadingChange={(isLoading) => onLayerLoadingChange('pipeline1', isLoading)}
          />

          <ArcGISPipelineLayer2
            map={mapRef.current}
            layerId="pipeline2-layer"
            visible={pipeline2Visible}
            onLoadingChange={(isLoading) => onLayerLoadingChange('pipeline2', isLoading)}
          />

          <AreaOfInterestLayer
            map={mapRef.current}
            layerId="area-of-interest-layer"
            visible={areaOfInterestVisible}
            onLoadingChange={(isLoading) => onLayerLoadingChange('area-of-interest', isLoading)}
          />

          <ArcGISAllShiptypeDensityLayer
            map={mapRef.current}
            layerId="density-allshiptype"
            visible={allShiptypeDensityVisible}
            onLoadingChange={(isLoading) => onLayerLoadingChange('density-allshiptype', isLoading)}
          />

          <ArcGISContainerDensityLayer
            map={mapRef.current}
            layerId="density-container"
            visible={containerDensityVisible}
            onLoadingChange={(isLoading) => onLayerLoadingChange('density-container', isLoading)}
          />

          <ArcGISBathymetryLayer
            map={mapRef.current}
            layerId="bsbd"
            visible={bathymetryVisible}
            onLoadingChange={(isLoading) => onLayerLoadingChange('bsbd', isLoading)}
          />
        </>
      )}

      <div className="absolute top-4 z-10" style={{ right: '3rem' }}>
        <TimeRangeSelector
          selectedRange={selectedRange + 'h'}
          onRangeChange={handleRangeChange}
        />
      </div>
      
      <div className="absolute bottom-12 right-4 z-10">
        <BasemapToggle map={mapRef.current} />
      </div>

      {/* Add DrawTool to the map controls */}
      <div className="absolute top-4 right-20 z-10">
        <DrawTool map={mapRef.current} />
      </div>
    </div>
  );
};

export default MapLibreMap;
