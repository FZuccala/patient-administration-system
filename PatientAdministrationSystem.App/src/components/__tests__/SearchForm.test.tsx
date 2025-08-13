import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchForm from '../SearchForm';

// Mock the hooks
vi.mock('../../hooks/usePatients', () => ({
  useHospitals: vi.fn(),
}));

import { useHospitals } from '../../hooks/usePatients';

describe('SearchForm', () => {
  const mockOnSearch = vi.fn();
  const mockHospitals = [
    { id: '1', name: 'Hospital A' },
    { id: '2', name: 'Hospital B' },
  ];

  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    // Use type assertion to simplify the mock
    const mockUseHospitals = useHospitals as MockedFunction<typeof useHospitals>;
    mockUseHospitals.mockReturnValue({
      data: mockHospitals,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useHospitals>);
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  it('renders search form elements', async () => {
    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={false}
      />,
    );

    expect(screen.getByLabelText(/search patient/i)).toBeInTheDocument();
    // For the Select component, we verify that the specific label exists using exact text
    expect(screen.getByText('Hospital')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByLabelText(/from date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('loads hospitals on mount', async () => {
    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={false}
      />,
    );

    // Verify that the useHospitals hook is called when the component mounts
    await waitFor(() => {
      expect(useHospitals).toHaveBeenCalled();
    });

    // Verify that the combobox is present
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onSearch with correct parameters when form is submitted', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={false}
      />,
    );

    // Fill in the form
    const searchInput = screen.getByLabelText(/search patient/i);
    await user.type(searchInput, 'John Doe');

    const submitButton = screen.getByRole('button', { name: /search/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        searchTerm: 'John Doe',
        hospitalId: undefined,
        fromDate: undefined,
        toDate: undefined,
        page: 1,
        pageSize: 10,
      });
    });
  });

  it('validates date range and shows validation errors', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={false}
      />,
    );

    // Set invalid date range (from > to)
    const fromDateInput = screen.getByLabelText(/from date/i);
    const toDateInput = screen.getByLabelText(/to date/i);

    await user.type(fromDateInput, '2023-12-31');
    await user.type(toDateInput, '2023-01-01');

    const submitButton = screen.getByRole('button', { name: /search/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/to date must be after from date/i)).toBeInTheDocument();
    });

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('clears form when reset button is clicked', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={false}
      />,
    );

    // Fill in the form
    const searchInput = screen.getByLabelText(/search patient/i);
    await user.type(searchInput, 'John Doe');

    // Click reset
    const resetButton = screen.getByRole('button', { name: /clear/i });
    await user.click(resetButton);

    expect(searchInput).toHaveValue('');
    expect(mockOnSearch).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
  });

  it('disables form elements when loading', () => {
    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={true}
      />,
    );

    expect(screen.getByLabelText(/search patient/i)).toBeDisabled();
    expect(screen.getByLabelText(/from date/i)).toBeDisabled();
    expect(screen.getByLabelText(/to date/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /searching.../i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /clear/i })).toBeDisabled();
  });

  /*
   * Additional tests that could be implemented:
   *
   * 1. Test hospital selection functionality
   * 2. Test search term length validation (>100 characters)
   * 3. Test future date validation
   * 4. Test API error handling when loading hospitals fails
   * 5. Test accessibility features (ARIA labels, keyboard navigation)
   * 6. Test form submission with different combinations of filters
   * 7. Test component behavior with different screen sizes (responsive)
   * 8. Test internationalization if multiple languages are supported
   * 9. Test performance with large hospital lists
   * 10. Integration tests with the parent App component
   */
});
