import { api } from '../apiInterceptors';

export interface DriverProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedBus?: {
    id: string;
    busNumber: string;
    plateNumber: string;
    capacity: number;
    model: string;
  } | null;
}

export interface DriverBusInfo {
  id: string;
  busNumber: string;
  plateNumber: string;
  capacity: number;
  model: string;
  isActive: boolean;
  route?: {
    id: string;
    name: string;
    startStop: string;
    endStop: string;
    stops: string[];
  } | null;
}

export interface LoginDriverRequest {
  email: string;
  password: string;
}

export interface LoginDriverResponse {
  access_token: string;
  refresh_token: string;
  user: DriverProfile;
  message: string;
}

// Get driver profile
export const getDriverProfile = async (): Promise<DriverProfile> => {
  try {
    console.log('[getDriverProfile] Making API call to /driver/profile');
    const response = await api.get<{ data: DriverProfile }>('/driver/profile');
    console.log('[getDriverProfile] API response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('[getDriverProfile] Error fetching driver profile:', error);
    throw error;
  }
};

// Get driver's assigned bus
export const getDriverBus = async (): Promise<DriverBusInfo> => {
  try {
    const response = await api.get<{ data: DriverBusInfo }>('/driver/bus');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching driver bus:', error);
    throw error;
  }
};

// Login driver
export const loginDriver = async (credentials: LoginDriverRequest): Promise<LoginDriverResponse> => {
  try {
    const response = await api.post<LoginDriverResponse>('/driver/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in driver:', error);
    throw error;
  }
};

// Update bus location (for location tracking)
export const updateBusLocation = async (busId: string, locationData: {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  status: string;
}) => {
  try {
    const response = await api.post(`/tracking/bus/${busId}/location`, locationData);
    return response.data;
  } catch (error) {
    console.error('Error updating bus location:', error);
    throw error;
  }
};

// Change password (using the general auth endpoint)
export const changeDriverPassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error('Error changing driver password:', error);
    throw error;
  }
}; 