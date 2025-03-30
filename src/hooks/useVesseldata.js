// hooks/useVesselData.js
import { useState, useEffect, useCallback } from 'react';

export const useVesselData = (selectedRange) => {
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVesselLocations = useCallback(async () => {
    console.log('Fetching vessel locations');
    try {
      const response = await fetch(
        'https://meri.digitraffic.fi/api/ais/v1/locations?' +
        'longitude=21.33363593514353&latitude=59.24609386621712&radius=500'
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      console.log('Fetched vessel data:', data.features?.length || 0, 'vessels');
      return data.features || [];
    } catch (error) {
      console.error('Error fetching vessel locations:', error);
      throw error;
    }
  }, []);

  const updateVessels = useCallback(async () => {
    console.log('Updating vessels data');
    setLoading(true);
    try {
      const timeRangeInHours = parseInt(selectedRange);
      const currentTime = Date.now();
      const startTime = currentTime - (timeRangeInHours * 60 * 60 * 1000);
      
      const vesselData = await fetchVesselLocations();
      
      const filteredVessels = vesselData.filter(vessel => {
        const vesselTime = vessel.properties.timestampExternal;
        return vesselTime >= startTime && vesselTime <= currentTime;
      });

      console.log('Setting filtered vessels:', filteredVessels.length);
      setVessels(filteredVessels);
      setError(null);
    } catch (err) {
      console.error('Error in updateVessels:', err);
      setError(err.message);
      setVessels([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRange, fetchVesselLocations]);

  useEffect(() => {
    console.log('Setting up vessel data polling');
    let isMounted = true;
    let intervalId;

    // Immediate initial fetch
    updateVessels();

    // Set up polling interval - every 30 seconds
    intervalId = setInterval(() => {
      if (isMounted) {
        updateVessels();
      }
    }, 30000);

    return () => {
      console.log('Cleaning up vessel data polling');
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [updateVessels]);

  return {
    vessels,
    loading,
    error
  };
};