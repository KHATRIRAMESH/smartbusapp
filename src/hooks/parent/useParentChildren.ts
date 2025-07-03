import { useQuery } from '@tanstack/react-query';
import { appAxios } from '@/service/apiInterceptors';

interface Child {
  id: string;
  name: string;
  class: string;
  busId: string;
  busName: string;
  schoolName: string;
  pickupStop: string;
  dropStop: string;
  isPresent: boolean;
}

interface ApiResponse {
  data: Child[];
}

export const useParentChildren = () => {
  return useQuery({
    queryKey: ['parentChildren'],
    queryFn: async (): Promise<Child[]> => {
      const response = await appAxios.get<ApiResponse>('/parent/children');
      return response.data.data;
    },
  });
}; 