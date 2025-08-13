import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PatientSearchService } from '@/services/patientSearchService';
import { SearchRequest } from '@/types';

export const useSearchPatientVisits = (request: SearchRequest) => {
  return useQuery({
    queryKey: ['patientVisits', request],
    queryFn: () => PatientSearchService.searchPatientVisits(request),
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePatientVisit = (patientId: string, visitId: string) => {
  return useQuery({
    queryKey: ['patientVisit', patientId, visitId],
    queryFn: () => PatientSearchService.getPatientVisit(patientId, visitId),
    enabled: !!patientId && !!visitId,
  });
};

export const useHospitals = () => {
  return useQuery({
    queryKey: ['hospitals'],
    queryFn: () => PatientSearchService.getAllHospitals(),
    staleTime: 10 * 60 * 1000, // 10 minutes - hospitals don't change often
  });
};

// Hook to prefetch next page
export const usePrefetchNextPage = () => {
  const queryClient = useQueryClient();

  const prefetchNextPage = (currentRequest: SearchRequest) => {
    const nextPageRequest = {
      ...currentRequest,
      page: (currentRequest.page || 1) + 1,
    };

    queryClient.prefetchQuery({
      queryKey: ['patientVisits', nextPageRequest],
      queryFn: () => PatientSearchService.searchPatientVisits(nextPageRequest),
      staleTime: 2 * 60 * 1000,
    });
  };

  return { prefetchNextPage };
};
