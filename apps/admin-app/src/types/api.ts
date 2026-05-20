export interface ApiResponse<T = Record<string, unknown>> {
  statusCode: number;
  message: string;
  data: T;
  error?: string;
  errors?: { fieldErrors?: Record<string, string[]> };
}

export class ApiError extends Error {
  statusCode: number;
  data: Record<string, unknown>;
  error?: string;
  errors?: { fieldErrors?: Record<string, string[]> };

  constructor(params: {
    message: string;
    statusCode: number;
    data?: Record<string, unknown>;
    error?: string;
    errors?: { fieldErrors?: Record<string, string[]> };
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.statusCode = params.statusCode;
    this.data = params.data ?? {};
    this.error = params.error;
    this.errors = params.errors;
  }
}
