// src/App.jsx
import { useState, useEffect } from "react";
import posthog from "posthog-js";
import MapLibreMap from "./components/map/MapLibreMap";
import SidePanel from "./components/map/SidePanel";
import "./App.css";
import { supabase } from "./supabase/supabaseClient";

function App() {
  const disablePosthog = import.meta.env.DEV;

  useEffect(() => {
    if (disablePosthog) {
      console.log("Development mode: Skipping PostHog initialization.");
      return;
    }
    try {
      if (!import.meta.env.VITE_POSTHOG_API_KEY) {
        console.warn("PostHog API key is missing. Please check your environment variables.");
        return;
      }
      posthog.init(import.meta.env.VITE_POSTHOG_API_KEY, {
        api_host: import.meta.env.VITE_POSTHOG_HOST || "https://eu.i.posthog.com",
        loaded: (posthogInstance) => {
          if (posthogInstance.get_distinct_id() === null) {
            console.warn("PostHog may be blocked by an ad blocker");
          }
        }
      });
    } catch (error) {
      console.warn("PostHog initialization error:", error);
    }
  }, [disablePosthog]);

  useEffect(() => {
    if (!disablePosthog) {
      posthog.capture("$pageview");
    }
  }, [disablePosthog]);

  // Manage layers, settings, etc.
  const [layers, setLayers] = useState({
    "Real-time Data": {
      vessels: { id: "vessels", name: "Vessels", visible: true }
    },
    "Cables and Pipelines": {
      Cables: {
        helcom: { id: "helcom", name: "Helcom Cables", visible: true },
        submarinecables: {
          id: "submarinecables",
          name: "Submarine Cable Map Cables",
          visible: false
        }
      },
      Pipelines: {
        pipeline1: { id: "pipeline1", name: "Helcom pipelines 1", visible: true },
        pipeline2: { id: "pipeline2", name: "Helcom pipelines 2", visible: true }
      }
    },
    "Areas of Interest": {
      "area-of-interest": {
        id: "area-of-interest",
        name: "Area of Interest",
        visible: true
      }
    },
    "Historical Averages": {
      "2022 AIS Shipping Density": {
        allshiptype: {
          id: "density-allshiptype",
          name: "2022 All shiptype AIS Shipping Density",
          visible: false
        },
        container: {
          id: "density-container",
          name: "2022 Container AIS Shipping Density",
          visible: false
        }
      }
    },
    Bathymetry: {
      bsbd: {
        id: "bsbd",
        name: "Baltic Sea Bathymetry Database BSBD",
        visible: false
      }
    }
  });
  const [layerSettings, setLayerSettings] = useState({});
  const [loadingLayers, setLoadingLayers] = useState({});

  // Create state for the authentication session.
  const [session, setSession] = useState(null);

  // Listen for Supabase auth state changes using the new API
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to find layer name by its ID (for tracking purposes)
  const findLayerNameById = (obj, targetId) => {
    for (const [key, value] of Object.entries(obj)) {
      if (value.id === targetId) {
        return value.name;
      } else if (typeof value === "object") {
        const result = findLayerNameById(value, targetId);
        if (result) return result;
      }
    }
    return null;
  };

  const handleToggleLayer = (layerId) => {
    setLayers((prevLayers) => {
      const updateLayer = (obj) => {
        const updated = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value.id === layerId) {
            const newVisible = !value.visible;
            updated[key] = { ...value, visible: newVisible };

            // Track layer toggle event only in production
            if (!disablePosthog) {
              posthog.capture("layer_toggled", {
                layer_id: layerId,
                layer_name: value.name,
                new_state: newVisible ? "visible" : "hidden"
              });
            }
          } else if (typeof value === "object") {
            updated[key] = updateLayer(value);
          } else {
            updated[key] = value;
          }
        }
        return updated;
      };
      return updateLayer(prevLayers);
    });
  };

  const handleUpdateLayerSettings = (layerId, settings) => {
    setLayerSettings((prev) => {
      // Track layer settings update only in production
      if (!disablePosthog) {
        posthog.capture("layer_settings_updated", {
          layer_id: layerId,
          layer_name: findLayerNameById(layers, layerId),
          settings: settings
        });
      }
      return {
        ...prev,
        [layerId]: settings
      };
    });
  };

  const handleLayerLoadingChange = (layerId, isLoading) => {
    setLoadingLayers((prev) => {
      // Track layer loading state changes only in production
      if (!disablePosthog) {
        if (isLoading) {
          posthog.capture("layer_loading_started", {
            layer_id: layerId,
            layer_name: findLayerNameById(layers, layerId)
          });
        } else {
          posthog.capture("layer_loading_completed", {
            layer_id: layerId,
            layer_name: findLayerNameById(layers, layerId)
          });
        }
      }
      return {
        ...prev,
        [layerId]: isLoading
      };
    });
  };

  return (
    <div className="app">
      <SidePanel
        layers={layers}
        onToggleLayer={handleToggleLayer}
        onUpdateLayerSettings={handleUpdateLayerSettings}
        loadingLayers={loadingLayers}
        session={session}
        onAuthChange={setSession}
      />
      <MapLibreMap
        layers={layers}
        layerSettings={layerSettings}
        onLayerLoadingChange={handleLayerLoadingChange}
      />
    </div>
  );
}

export default App;