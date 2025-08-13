import { useState } from 'react';
import SearchForm from './components/SearchForm';
import PatientVisitTable from './components/PatientVisitTable';
import { useSearchPatientVisits, usePrefetchNextPage } from './hooks/usePatients';
import { SearchRequest } from './types';
import { isHttpError } from './types/api';

function App() {
  const [currentRequest, setCurrentRequest] = useState<SearchRequest>({ page: 1, pageSize: 10 });
  const { prefetchNextPage } = usePrefetchNextPage();

  const { data: searchResults, isLoading, error, isError } = useSearchPatientVisits(currentRequest);

  const handleSearch = (request: SearchRequest) => {
    setCurrentRequest(request);

    // Prefetch next page if there are results
    if (searchResults && searchResults.hasNextPage) {
      prefetchNextPage(request);
    }
  };

  const handlePageChange = (page: number) => {
    const newRequest = { ...currentRequest, page };
    setCurrentRequest(newRequest);

    // Prefetch next page
    if (page < (searchResults?.totalPages || 0)) {
      prefetchNextPage(newRequest);
    }
  };

  const errorMessage = isError
    ? isHttpError(error)
      ? error.response?.data?.error || error.response?.data?.message || error.message || 'Error searching patients. Please try again.'
      : error?.message || 'Error searching patients. Please try again.'
    : null;

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-8'>
        <header className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>Patient Administration System</h1>
          <p className='text-lg text-gray-600'>Search patient visit information</p>
        </header>

        <main className='space-y-8 max-w-6xl mx-auto'>
          <SearchForm
            onSearch={handleSearch}
            loading={isLoading}
          />
          <PatientVisitTable
            data={searchResults || null}
            loading={isLoading}
            error={errorMessage}
            onPageChange={handlePageChange}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
