import { reverseGeocode } from "@/utils/mapUtils";
import * as Location from "expo-location";
import * as geolib from "geolib";
import { useEffect, useRef, useState } from "react";

export const useDriverLocation = () => {
  const watchId = useRef<Location.LocationSubscription | null>(null);

  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [address, setAddress] = useState<string>("");

  const lastGeocodedCoords = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const GEO_THRESHOLD_METERS = 10; // minimum distance to trigger reverse geocoding

  useEffect(() => {
    const startSharingLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setCoords({ latitude, longitude });
      lastGeocodedCoords.current = { latitude, longitude };

      const address = await reverseGeocode(latitude, longitude);
      setAddress(address);

      watchId.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // fallback
          distanceInterval: 5,
        },
        async (loc) => {
          const { latitude, longitude } = loc.coords;

          setCoords({ latitude, longitude });

          const last = lastGeocodedCoords.current;
          const movedFar = last
            ? geolib.getDistance(last, { latitude, longitude }) >
              GEO_THRESHOLD_METERS
            : true;

          if (movedFar) {
            lastGeocodedCoords.current = { latitude, longitude };
            const address = await reverseGeocode(latitude, longitude);
            console.log("📍 New address:", address);
            setAddress(address);
          }
        }
      );
    };

    startSharingLocation();

    return () => {
      watchId.current?.remove();
      console.log("🚫 Stopped tracking bus");
    };
  }, []);

  return { coords, address };
};
