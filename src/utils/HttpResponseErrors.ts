import { APIGatewayProxyResult } from 'aws-lambda';

import { baseHeaders } from '../constants';

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message = 'Bad request', details?: unknown) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static invalidInput(message = 'Invalid input', details?: unknown) {
    return new AppError(message, 402, 'INVALID_INPUT', details);
  }

  static notFound(message = 'Not found', details?: unknown) {
    return new AppError(message, 404, 'NOT_FOUND', details);
  }

  static internal(message = 'Internal server error', details?: unknown) {
    return new AppError(message, 500, 'INTERNAL_ERROR', details);
  }
}

export const toHttpResponse = (err: unknown): APIGatewayProxyResult => {
  if (err instanceof AppError) {
    const payload = { code: err.code, message: err.message, details: err.details };
    return {
      statusCode: err.statusCode,
      headers: baseHeaders,
      body: JSON.stringify(payload),
    };
  }

  const payload = { code: 'INTERNAL_ERROR', message: 'Internal server error' };
  return {
    statusCode: 500,
    headers: baseHeaders,
    body: JSON.stringify(payload),
  };
};
