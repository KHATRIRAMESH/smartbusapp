import { useQuery } from '@tanstack/react-query';
import { appAxios } from '@/service/apiInterceptors';
import { BusTracking } from '@/utils/types/types';

const fetchTracking = async (childId: string) => {
  const res = await appAxios.get(`/parent/tracking/${childId}`);
  return (res.data as { data: BusTracking }).data;
};

export const useParentTracking = (childId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['tracking', childId],
    queryFn: () => fetchTracking(childId),
    enabled,
  });
}; 