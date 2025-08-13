import * as yup from 'yup';

export const searchSchema = yup.object({
  searchTerm: yup.string().max(100, 'Search term cannot exceed 100 characters').optional(),
  hospitalId: yup.string().optional(),
  fromDate: yup.date().max(new Date(), 'From date cannot be in the future').nullable().optional(),
  toDate: yup
    .date()
    .max(new Date(), 'To date cannot be in the future')
    .when('fromDate', (fromDate, schema) => {
      return fromDate && fromDate[0] ? schema.min(fromDate[0], 'To date must be after from date') : schema;
    })
    .nullable()
    .optional(),
  page: yup.number().min(1, 'Page must be greater than 0').optional().default(1),
  pageSize: yup.number().min(1, 'Page size must be at least 1').max(100, 'Page size cannot exceed 100').optional().default(10),
});

export type SearchFormData = yup.InferType<typeof searchSchema>;

// Specific type for form data as it comes from react-hook-form
export interface FormSubmissionData {
  searchTerm?: string;
  hospitalId?: string;
  fromDate?: Date | null;
  toDate?: Date | null;
  page: number;
  pageSize: number;
}
