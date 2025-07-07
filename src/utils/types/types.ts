import { RelativePathString } from "expo-router/build/types";

export interface CustomButtonProps {
  title: string;
  loading?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface CustomTextProps {
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "h7" | "h8";
  style?: any;
  fontSize?: number;
  children: React.ReactNode;
  fontFamily?: "SemiBold" | "Regular" | "Bold" | "Medium" | "Light";
  numberOfLines?: number;
}

export type AppRoute = RelativePathString
  | "/"
  | "/role"
  | "/(driver)/home"
  | "/(driver)/auth"
  | "/(parent)/home"
  | "/(parent)/auth";

// Child type
export interface Bus {
  id: string;
  busNumber: string;
  plateNumber: string;
  capacity: number;
  model: string;
  driver: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
}

export interface Route {
  id: string;
  name: string;
  startStop: string;
  endStop: string;
  stops: string[];
}

export interface Child {
  id: string;
  name: string;
  class: string;
  pickupStop: string;
  dropStop: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bus: Bus | null;
  route: Route | null;
}

// Parent profile type
export interface ParentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  schoolAdminId: string;
  createdAt: string;
  updatedAt: string;
}

// Tracking type
export interface BusTracking {
  bus: {
    id: string;
    busNumber: string;
    plateNumber: string;
    capacity: number;
    model: string;
    isActive: boolean;
  };
  driver: {
    id: string;
    name: string;
    phone: string;
    licenseNumber: string;
  } | null;
  route: {
    id: string;
    name: string;
    startStop: string;
    endStop: string;
    stops: string[];
  } | null;
  children: Array<{
    id: string;
    name: string;
    class: string;
    pickupStop: string;
    dropStop: string;
  }>;
  currentLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
    status: string;
    estimatedArrival: string;
    speed: string;
  };
}

// Driver types
export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bus?: Bus;
}

export interface DriverLoginResponse {
  access_token: string;
  refresh_token: string;
  user: Driver;
}

export interface DriverLoginPayload {
  email: string;
  password: string;
}