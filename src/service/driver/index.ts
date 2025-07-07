import { api } from '../apiInterceptors';
import { authAxios } from '../authService';
import { Driver, DriverLoginPayload, DriverLoginResponse } from '@/utils/types/types';
import { tokenStorage } from '@/store/storage';

interface LocationUpdate {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  status: string;
}

export const loginDriver = async (payload: DriverLoginPayload): Promise<DriverLoginResponse> => {
  const response = await authAxios.post<DriverLoginResponse>('/driver/login', payload);
  return response.data;
};

export const getDriverProfile = async (): Promise<Driver> => {
  const response = await api.get<{ data: Driver }>('/driver/profile');
  return response.data.data;
};

export const getDriverBus = async () => {
  const response = await api.get<{ data: any }>('/driver/bus');
  return response.data.data;
};

export const updateBusLocation = async (busId: string, locationData: LocationUpdate) => {
  try {
    const response = await api.post(`/tracking/bus/${busId}/location`, locationData);
    return response.data;
  } catch (error) {
    console.error('Error updating bus location:', error);
    throw error;
  }
};

export const updateDriverStatus = async (status: 'online' | 'offline' | 'on_trip'): Promise<void> => {
  await api.post('/driver/status', { status });
}; 