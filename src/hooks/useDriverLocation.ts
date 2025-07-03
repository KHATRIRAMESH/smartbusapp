import { useWS } from "@/service/WSProvider";
import { reverseGeocode } from "@/utils/mapUtils";
import * as Location from "expo-location";
import * as geolib from "geolib";
import { useEffect, useRef, useState } from "react";

export const useDriverLocation = () => {
  const { emit } = useWS();
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
  const lastSentCoords = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const GEO_THRESHOLD_METERS = 50; // minimum distance to trigger location update

  useEffect(() => {
    const startSharingLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      emit("goOnDuty", { latitude, longitude });

      setCoords({ latitude, longitude });
      lastGeocodedCoords.current = { latitude, longitude };
      lastSentCoords.current = { latitude, longitude };
      emit("updateLocation", { latitude, longitude });

      const address = await reverseGeocode(latitude, longitude);
      setAddress(address);

      watchId.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // fallback
          distanceInterval: 1, // 1 meter
        },
        async (loc) => {
          const { latitude, longitude } = loc.coords;

          setCoords({ latitude, longitude });

          // Only emit if moved more than threshold
          const last = lastSentCoords.current;
          const movedFar = last
            ? geolib.getDistance(last, { latitude, longitude }) >= GEO_THRESHOLD_METERS
            : true;

          if (movedFar) {
            emit("updateLocation", { latitude, longitude });
            lastSentCoords.current = { latitude, longitude };
          }

          // Reverse geocode if moved far from last geocoded point
          const lastGeo = lastGeocodedCoords.current;
          const movedFarForGeo = lastGeo
            ? geolib.getDistance(lastGeo, { latitude, longitude }) > 5
            : true;

          if (movedFarForGeo) {
            lastGeocodedCoords.current = { latitude, longitude };
            const address = await reverseGeocode(latitude, longitude);
            setAddress(address);
          }
        }
      );
    };

    startSharingLocation();

    return () => {
      watchId.current?.remove();
      emit("goOffDuty", {});
      console.log("🚫 Stopped location tracking");
    };
  }, []);

  return { coords, address };
};
