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

  it('handles search term length validation (>100 characters)', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={false}
      />,
    );

    const longSearchTerm = 'a'.repeat(101); // 101 characters
    const searchInput = screen.getByLabelText(/search patient/i);

    await user.type(searchInput, longSearchTerm);

    const submitButton = screen.getByRole('button', { name: /search/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/search term cannot exceed 100 characters/i)).toBeInTheDocument();
    });

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('validates future dates', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={false}
      />,
    );

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];

    const fromDateInput = screen.getByLabelText(/from date/i);
    await user.type(fromDateInput, futureDateString);

    const submitButton = screen.getByRole('button', { name: /search/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/from date cannot be in the future/i)).toBeInTheDocument();
    });

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('handles API error when loading hospitals fails', async () => {
    const mockUseHospitals = useHospitals as MockedFunction<typeof useHospitals>;
    mockUseHospitals.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load hospitals'),
      isError: true,
      isSuccess: false,
      isPending: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useHospitals>);

    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={false}
      />,
    );

    // The form should still render even if hospitals fail to load
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    // The select should still be enabled (only disabled during loading)
    expect(screen.getByRole('combobox')).not.toBeDisabled();
    // But it should only show "All hospitals" option (check the visible one in the select trigger)
    expect(screen.getAllByText('All hospitals')[0]).toBeInTheDocument();
  });

  it('tests accessibility features', async () => {
    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={false}
      />,
    );

    // Check ARIA labels
    expect(screen.getByLabelText(/search patient/i)).toHaveAttribute('id', 'searchTerm');
    expect(screen.getByLabelText(/from date/i)).toHaveAttribute('type', 'date');
    expect(screen.getByLabelText(/to date/i)).toHaveAttribute('type', 'date');

    // Check that combobox has proper ARIA attributes
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).toHaveAttribute('role', 'combobox');

    // Check form structure (forms don't have explicit role by default)
    const form = document.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('submits form with different combinations of filters', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={false}
      />,
    );

    // Test with search term only
    const searchInput = screen.getByLabelText(/search patient/i);
    await user.type(searchInput, 'John');

    let submitButton = screen.getByRole('button', { name: /search/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        searchTerm: 'John',
        hospitalId: undefined,
        fromDate: undefined,
        toDate: undefined,
        page: 1,
        pageSize: 10,
      });
    });

    mockOnSearch.mockClear();

    // Test with dates only
    await user.clear(searchInput);
    const fromDateInput = screen.getByLabelText(/from date/i);
    const toDateInput = screen.getByLabelText(/to date/i);

    await user.type(fromDateInput, '2023-01-01');
    await user.type(toDateInput, '2023-12-31');

    submitButton = screen.getByRole('button', { name: /search/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        searchTerm: undefined,
        hospitalId: undefined,
        fromDate: '2023-01-01',
        toDate: '2023-12-31',
        page: 1,
        pageSize: 10,
      });
    });
  });

  it('handles performance with large hospital lists', async () => {
    // Mock a large hospital list
    const largeHospitalList = Array.from({ length: 1000 }, (_, i) => ({
      id: `hospital-${i}`,
      name: `Hospital ${i}`,
    }));

    const mockUseHospitals = useHospitals as MockedFunction<typeof useHospitals>;
    mockUseHospitals.mockReturnValue({
      data: largeHospitalList,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isPending: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useHospitals>);

    const startTime = performance.now();
    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={false}
      />,
    );
    const endTime = performance.now();

    // Component should render within reasonable time (less than 500ms for large datasets)
    expect(endTime - startTime).toBeLessThan(500);

    // Verify the component still works correctly
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(useHospitals).toHaveBeenCalled();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={false}
      />,
    );

    // Test Tab navigation through form elements
    const searchInput = screen.getByLabelText(/search patient/i);
    const combobox = screen.getByRole('combobox');
    const fromDateInput = screen.getByLabelText(/from date/i);
    const toDateInput = screen.getByLabelText(/to date/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    const clearButton = screen.getByRole('button', { name: /clear/i });

    // Start from search input
    searchInput.focus();
    expect(searchInput).toHaveFocus();

    // Tab to next elements
    await user.tab();
    expect(combobox).toHaveFocus();

    await user.tab();
    expect(fromDateInput).toHaveFocus();

    await user.tab();
    expect(toDateInput).toHaveFocus();

    await user.tab();
    expect(searchButton).toHaveFocus();

    await user.tab();
    expect(clearButton).toHaveFocus();
  });

  it('handles form submission with Enter key', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={false}
      />,
    );

    const searchInput = screen.getByLabelText(/search patient/i);
    await user.type(searchInput, 'John Doe');

    // Submit form with Enter key
    await user.keyboard('{Enter}');

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

  it('maintains form state during loading', async () => {
    userEvent.setup();
    renderWithQueryClient(
      <SearchForm
        onSearch={mockOnSearch}
        loading={true}
      />,
    );

    // All form elements should be disabled during loading
    expect(screen.getByLabelText(/search patient/i)).toBeDisabled();
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByLabelText(/from date/i)).toBeDisabled();
    expect(screen.getByLabelText(/to date/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /searching.../i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /clear/i })).toBeDisabled();
  });

  /*
   * @TODO: Additional tests that could be implemented with more complex setup:
   *
   * 1. Test component behavior with different screen sizes (responsive) - requires jsdom window resizing
   * 2. Test internationalization if multiple languages are supported - requires i18n setup
   * 3. Integration tests with the parent App component - requires more complex test setup
   * 4. Visual regression tests - requires tools like Storybook + Chromatic
   * 5. End-to-end tests - requires tools like Playwright or Cypress
   */
});
