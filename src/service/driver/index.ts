import { apiClient } from '../apiInterceptors';

interface LocationUpdate {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  status: string;
}

export const updateBusLocation = async (busId: string, locationData: LocationUpdate) => {
  try {
    const response = await apiClient.post(`/tracking/bus/${busId}/location`, locationData);
    return response.data;
  } catch (error) {
    console.error('Error updating bus location:', error);
    throw error;
  }
}; 