// Export parent service modules here as you modularize API logic

import { appAxios } from '../apiInterceptors';

export interface Child {
  id: string;
  name: string;
  class: string;
  busId: string | null;
  pickupStop: string;
  dropStop: string;
  isPresent: boolean;
}

export interface ParentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: Child[];
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export const getParentProfile = async (): Promise<ParentProfile> => {
  const res = await appAxios.get<ApiResponse<ParentProfile>>('/parent/profile');
  return res.data.data;
};
