export interface PatientVisit {
  patientId: string;
  firstName: string;
  lastName: string;
  email: string;
  hospitalId: string;
  hospitalName: string;
  visitId: string;
  visitDate: string;
}

export interface Hospital {
  id: string;
  name: string;
}

export interface SearchRequest {
  searchTerm?: string;
  hospitalId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiError {
  error: string;
}
