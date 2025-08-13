import apiClient from '../api/apiClient';
import { PatientVisit, Hospital, SearchRequest, SearchResponse } from '../types';

export class PatientSearchService {
  static async searchPatientVisits(request: SearchRequest): Promise<SearchResponse<PatientVisit>> {
    const params = new URLSearchParams();

    if (request.searchTerm) params.append('searchTerm', request.searchTerm);
    if (request.hospitalId) params.append('hospitalId', request.hospitalId);
    if (request.fromDate) params.append('fromDate', request.fromDate);
    if (request.toDate) params.append('toDate', request.toDate);
    if (request.page) params.append('page', request.page.toString());
    if (request.pageSize) params.append('pageSize', request.pageSize.toString());

    const response = await apiClient.get<SearchResponse<PatientVisit>>(`/api/patients/visits?${params.toString()}`);

    return response.data;
  }

  static async getPatientVisit(patientId: string, visitId: string): Promise<PatientVisit> {
    const response = await apiClient.get<PatientVisit>(`/api/patients/${patientId}/visits/${visitId}`);

    return response.data;
  }

  static async getAllHospitals(): Promise<Hospital[]> {
    const response = await apiClient.get<Hospital[]>('/api/patients/hospitals');
    return response.data;
  }
}
