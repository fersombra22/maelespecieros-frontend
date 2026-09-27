export interface Page<T> {
  content: T[];

  totalElements: number;

  totalPages: number;

  size: number;

  number: number;

  first: boolean;
  last: boolean;
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}
