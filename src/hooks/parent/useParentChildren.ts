import { useQuery } from '@tanstack/react-query';
import { appAxios } from '@/service/apiInterceptors';
import { Child } from '@/utils/types/types';

const fetchChildren = async () => {
  const res = await appAxios.get('/parent/children');
  return (res.data as { data: Child[] }).data || [];
};

export const useParentChildren = () => {
  return useQuery({ queryKey: ['children'], queryFn: fetchChildren });
}; 