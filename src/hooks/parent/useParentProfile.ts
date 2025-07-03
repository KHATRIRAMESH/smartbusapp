import { useQuery } from '@tanstack/react-query';
import { appAxios } from '@/service/apiInterceptors';
import { ParentProfile } from '@/utils/types/types';

const fetchParentProfile = async () => {
  const res = await appAxios.get('/parent/profile');
  return (res.data as { data: ParentProfile }).data;
};

export const useParentProfile = () => {
  return useQuery({ queryKey: ['parentProfile'], queryFn: fetchParentProfile });
}; 