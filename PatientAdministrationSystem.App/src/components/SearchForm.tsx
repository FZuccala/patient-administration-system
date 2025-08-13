import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { SearchRequest } from '@/types';
import { searchSchema, FormSubmissionData } from '@/schemas/searchSchema';
import { useHospitals } from '@/hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SearchFormProps {
  onSearch: (request: SearchRequest) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
  const { data: hospitals, isLoading: loadingHospitals } = useHospitals();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(searchSchema),
    defaultValues: {
      searchTerm: '',
      hospitalId: 'all',
      fromDate: undefined,
      toDate: undefined,
      page: 1,
      pageSize: 10,
    },
  });

  const hospitalId = watch('hospitalId');

  const onSubmit = (data: FormSubmissionData) => {
    const request: SearchRequest = {
      searchTerm: data.searchTerm?.trim() || undefined,
      hospitalId: data.hospitalId === 'all' ? undefined : data.hospitalId || undefined,
      fromDate: data.fromDate ? data.fromDate.toISOString().split('T')[0] : undefined,
      toDate: data.toDate ? data.toDate.toISOString().split('T')[0] : undefined,
      page: 1,
      pageSize: 10,
    };

    onSearch(request);
  };

  const handleReset = () => {
    reset();
    onSearch({ page: 1, pageSize: 10 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Patient Visits</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='space-y-6'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='searchTerm'>Search patient</Label>
              <Input
                id='searchTerm'
                placeholder='Name, last name, email or hospital...'
                disabled={loading}
                {...register('searchTerm')}
              />
              {errors.searchTerm && <p className='text-sm text-destructive'>{errors.searchTerm.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='hospitalId'>Hospital</Label>
              <Select
                value={hospitalId}
                onValueChange={value => setValue('hospitalId', value)}
                disabled={loading || loadingHospitals}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All hospitals' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All hospitals</SelectItem>
                  {hospitals?.map(hospital => (
                    <SelectItem
                      key={hospital.id}
                      value={hospital.id}
                    >
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.hospitalId && <p className='text-sm text-destructive'>{errors.hospitalId.message}</p>}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='fromDate'>From date</Label>
              <Input
                id='fromDate'
                type='date'
                disabled={loading}
                {...register('fromDate', {
                  setValueAs: value => (value ? new Date(value) : undefined),
                })}
              />
              {errors.fromDate && <p className='text-sm text-destructive'>{errors.fromDate.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='toDate'>To date</Label>
              <Input
                id='toDate'
                type='date'
                disabled={loading}
                {...register('toDate', {
                  setValueAs: value => (value ? new Date(value) : undefined),
                })}
              />
              {errors.toDate && <p className='text-sm text-destructive'>{errors.toDate.message}</p>}
            </div>
          </div>

          <div className='flex gap-4 justify-center'>
            <Button
              type='submit'
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={handleReset}
              disabled={loading}
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchForm;
