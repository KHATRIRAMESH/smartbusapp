import { useQuery } from '@tanstack/react-query';
import { getParentProfile, ParentProfile } from '../../service/parent';

export function useParentProfile() {
  return useQuery<ParentProfile>({
    queryKey: ['parentProfile'],
    queryFn: getParentProfile,
  });
} 