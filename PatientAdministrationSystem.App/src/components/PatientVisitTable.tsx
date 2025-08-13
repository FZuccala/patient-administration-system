import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { PatientVisit, SearchResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PatientVisitTableProps {
  data: SearchResponse<PatientVisit> | null;
  loading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
}

const PatientVisitTable: React.FC<PatientVisitTableProps> = ({ data, loading, error, onPageChange }) => {
  if (loading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-8'>
          <Loader2 className='h-6 w-6 animate-spin mr-2' />
          <span>Loading results...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='py-8'>
          <div className='text-center text-destructive'>
            <p className='text-lg font-medium'>Error</p>
            <p className='text-sm'>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Card>
        <CardContent className='py-8'>
          <div className='text-center text-muted-foreground'>
            <p className='text-lg'>No results found</p>
            <p className='text-sm'>Try adjusting your search criteria</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderPagination = () => {
    if (data.totalPages <= 1) return null;

    const currentPage = data.page;
    const totalPages = data.totalPages;
    const delta = 2; // Number of pages to show around current page

    // Calculate the range of pages to show around current page
    const rangeStart = Math.max(1, currentPage - delta);
    const rangeEnd = Math.min(totalPages, currentPage + delta);

    const pages: (number | string)[] = [
      // Add first page if not in range
      ...(rangeStart > 1 ? [1] : []),
      // Add ellipsis after first page if there's a gap
      ...(rangeStart > 2 ? ['...'] : []),
      // Add the range of pages around current page
      ...Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => rangeStart + i),
      // Add ellipsis before last page if there's a gap
      ...(rangeEnd < totalPages - 1 ? ['...'] : []),
      // Add last page if not in range
      ...(rangeEnd < totalPages ? [totalPages] : []),
    ];

    return (
      <div className='flex items-center justify-center space-x-2 py-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!data.hasPreviousPage}
        >
          <ChevronLeft className='h-4 w-4 mr-1' />
          Previous
        </Button>

        {pages.map((page, index) => (
          <span key={index}>
            {page === '...' ? (
              <span className='px-2 text-muted-foreground'>...</span>
            ) : (
              <Button
                variant={page === currentPage ? 'default' : 'outline'}
                size='sm'
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </Button>
            )}
          </span>
        ))}

        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!data.hasNextPage}
        >
          Next
          <ChevronRight className='h-4 w-4 ml-1' />
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Results</CardTitle>
        <CardDescription>
          Showing {data.data.length} of {data.totalCount} results (Page {data.page} of {data.totalPages})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Visit Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map(visit => (
                <TableRow key={`${visit.patientId}-${visit.visitId}`}>
                  <TableCell>
                    <div className='font-medium'>
                      {visit.firstName} {visit.lastName}
                    </div>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>{visit.email}</TableCell>
                  <TableCell>{visit.hospitalName}</TableCell>
                  <TableCell>{formatDate(visit.visitDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {renderPagination()}
      </CardContent>
    </Card>
  );
};

export default PatientVisitTable;
