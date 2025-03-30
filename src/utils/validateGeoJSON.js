// src/utils/validateGeoJSON.js
export const validateGeoJSON = (geojson) => {
    if (!geojson || typeof geojson !== 'object') {
      console.error('Invalid GeoJSON: not an object');
      return false;
    }
  
    if (geojson.type !== 'FeatureCollection') {
      console.error('Invalid GeoJSON: not a FeatureCollection');
      return false;
    }
  
    if (!Array.isArray(geojson.features)) {
      console.error('Invalid GeoJSON: features is not an array');
      return false;
    }
  
    const invalidFeatures = geojson.features.filter(feature => {
      if (!feature.type || feature.type !== 'Feature') {
        console.error('Invalid feature: missing or wrong type');
        return true;
      }
  
      if (!feature.geometry || !feature.geometry.type || !feature.geometry.coordinates) {
        console.error('Invalid feature: missing geometry or coordinates');
        return true;
      }
  
      if (!Array.isArray(feature.geometry.coordinates)) {
        console.error('Invalid feature: coordinates is not an array');
        return true;
      }
  
      return false;
    });
  
    if (invalidFeatures.length > 0) {
      console.error(`Found ${invalidFeatures.length} invalid features`);
      console.error('First invalid feature:', invalidFeatures[0]);
      return false;
    }
  
    return true;
  };