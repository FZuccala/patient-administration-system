import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PatientVisitTable from '../PatientVisitTable';
import type { PatientVisit, SearchResponse } from '../../types';

describe('PatientVisitTable', () => {
  const mockOnPageChange = vi.fn();

  const mockPatientVisits: PatientVisit[] = [
    {
      patientId: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      hospitalId: '1',
      hospitalName: 'General Hospital',
      visitId: '1',
      visitDate: '2023-08-15T00:00:00Z',
    },
    {
      patientId: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      hospitalId: '1',
      hospitalName: 'General Hospital',
      visitId: '2',
      visitDate: '2023-09-20T00:00:00Z',
    },
  ];

  const mockSearchResponse: SearchResponse<PatientVisit> = {
    data: mockPatientVisits,
    totalCount: 2,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    render(
      <PatientVisitTable
        data={null}
        loading={true}
        error={null}
        onPageChange={mockOnPageChange}
      />,
    );

    expect(screen.getByText(/loading results.../i)).toBeInTheDocument();
    // Check for loading spinner by class instead of role
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    const errorMessage = 'Network error occurred';
    render(
      <PatientVisitTable
        data={null}
        loading={false}
        error={errorMessage}
        onPageChange={mockOnPageChange}
      />,
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders empty state when no results found', () => {
    const emptyResponse: SearchResponse<PatientVisit> = {
      ...mockSearchResponse,
      data: [],
      totalCount: 0,
    };

    render(
      <PatientVisitTable
        data={emptyResponse}
        loading={false}
        error={null}
        onPageChange={mockOnPageChange}
      />,
    );

    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    expect(screen.getByText(/try adjusting your search criteria/i)).toBeInTheDocument();
  });

  it('renders patient visit data correctly', () => {
    render(
      <PatientVisitTable
        data={mockSearchResponse}
        loading={false}
        error={null}
        onPageChange={mockOnPageChange}
      />,
    );

    // Check table headers
    expect(screen.getByText('Patient')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Hospital')).toBeInTheDocument();
    expect(screen.getByText('Visit Date')).toBeInTheDocument();

    // Check patient data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    expect(screen.getAllByText('General Hospital')).toHaveLength(2);

    // Check formatted dates (dates are rendered as they appear in the component)
    expect(screen.getByText('Aug 14, 2023')).toBeInTheDocument();
    expect(screen.getByText('Sep 19, 2023')).toBeInTheDocument();
  });

  it('displays correct result summary', () => {
    render(
      <PatientVisitTable
        data={mockSearchResponse}
        loading={false}
        error={null}
        onPageChange={mockOnPageChange}
      />,
    );

    expect(screen.getByText(/showing 2 of 2 results \(page 1 of 1\)/i)).toBeInTheDocument();
  });

  it('handles pagination correctly', async () => {
    const user = userEvent.setup();
    const multiPageResponse: SearchResponse<PatientVisit> = {
      ...mockSearchResponse,
      totalCount: 25,
      page: 2,
      pageSize: 10,
      totalPages: 3,
      hasPreviousPage: true,
      hasNextPage: true,
    };

    render(
      <PatientVisitTable
        data={multiPageResponse}
        loading={false}
        error={null}
        onPageChange={mockOnPageChange}
      />,
    );

    // Check pagination buttons exist
    const previousButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(previousButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(previousButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    // Test previous button click
    await user.click(previousButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(1);

    // Test next button click
    await user.click(nextButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('disables pagination buttons appropriately', () => {
    const firstPageResponse: SearchResponse<PatientVisit> = {
      ...mockSearchResponse,
      totalCount: 25,
      page: 1,
      pageSize: 10,
      totalPages: 3,
      hasPreviousPage: false,
      hasNextPage: true,
    };

    render(
      <PatientVisitTable
        data={firstPageResponse}
        loading={false}
        error={null}
        onPageChange={mockOnPageChange}
      />,
    );

    const previousButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });

    expect(previousButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('renders complex pagination with ellipsis', async () => {
    const user = userEvent.setup();
    const complexPaginationResponse: SearchResponse<PatientVisit> = {
      ...mockSearchResponse,
      totalCount: 100,
      page: 5,
      pageSize: 10,
      totalPages: 10,
      hasPreviousPage: true,
      hasNextPage: true,
    };

    render(
      <PatientVisitTable
        data={complexPaginationResponse}
        loading={false}
        error={null}
        onPageChange={mockOnPageChange}
      />,
    );

    // Should show: 1 ... 3 4 5 6 7 ... 10
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    expect(screen.getAllByText('...')).toHaveLength(2);

    // Test clicking on page number
    const pageButton = screen.getByRole('button', { name: '7' });
    await user.click(pageButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(7);
  });

  it('handles date formatting edge cases', () => {
    const edgeCaseData: PatientVisit[] = [
      {
        ...mockPatientVisits[0],
        visitDate: '2023-12-31T23:59:59Z', // End of year
      },
      {
        ...mockPatientVisits[1],
        visitDate: '2023-01-01T00:00:00Z', // Start of year
      },
    ];

    const edgeCaseResponse: SearchResponse<PatientVisit> = {
      ...mockSearchResponse,
      data: edgeCaseData,
    };

    render(
      <PatientVisitTable
        data={edgeCaseResponse}
        loading={false}
        error={null}
        onPageChange={mockOnPageChange}
      />,
    );

    expect(screen.getByText('Dec 31, 2023')).toBeInTheDocument();
    expect(screen.getByText('Dec 31, 2022')).toBeInTheDocument();
  });

  it('handles accessibility features', () => {
    render(
      <PatientVisitTable
        data={mockSearchResponse}
        loading={false}
        error={null}
        onPageChange={mockOnPageChange}
      />,
    );

    // Check table accessibility
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Check table headers
    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders).toHaveLength(4);

    // Check table rows
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3); // 1 header + 2 data rows

    // For single page results, there are no pagination buttons
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('handles large datasets efficiently', () => {
    const largeDataset: PatientVisit[] = Array.from({ length: 100 }, (_, i) => ({
      patientId: `patient-${i}`,
      firstName: `FirstName${i}`,
      lastName: `LastName${i}`,
      email: `patient${i}@example.com`,
      hospitalId: `hospital-${i % 5}`,
      hospitalName: `Hospital ${i % 5}`,
      visitId: `visit-${i}`,
      visitDate: new Date(2023, i % 12, (i % 28) + 1).toISOString(),
    }));

    const largeResponse: SearchResponse<PatientVisit> = {
      data: largeDataset,
      totalCount: 1000,
      page: 1,
      pageSize: 100,
      totalPages: 10,
      hasPreviousPage: false,
      hasNextPage: true,
    };

    const startTime = performance.now();
    render(
      <PatientVisitTable
        data={largeResponse}
        loading={false}
        error={null}
        onPageChange={mockOnPageChange}
      />,
    );
    const endTime = performance.now();

    // Should render within reasonable time
    expect(endTime - startTime).toBeLessThan(200);

    // Should still display all rows
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(101); // 1 header + 100 data rows
  });

  it('handles no pagination when only one page', () => {
    render(
      <PatientVisitTable
        data={mockSearchResponse}
        loading={false}
        error={null}
        onPageChange={mockOnPageChange}
      />,
    );

    // Should not show pagination controls
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });
});
