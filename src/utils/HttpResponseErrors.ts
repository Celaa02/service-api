import { APIGatewayProxyResult } from 'aws-lambda';

import { baseHeaders } from '../constants';

/**
 * Clase base para manejar errores de aplicación con tipado y consistencia.
 *
 * Incluye:
 * - `statusCode`: código HTTP que debe devolver el handler.
 * - `code`: un identificador de error legible para el cliente.
 * - `details`: datos adicionales opcionales para debug o contexto.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  /**
   * Crea una instancia de AppError.
   *
   * @param message - Mensaje legible del error
   * @param statusCode - Código HTTP asociado (default: 400)
   * @param code - Código interno de error (default: BAD_REQUEST)
   * @param details - Información adicional opcional
   */
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

/**
 * Convierte un error en una respuesta HTTP válida para API Gateway.
 *
 * - Si el error es de tipo `AppError`, devuelve el `statusCode`, `code`, `message` y `details`.
 * - Si es otro error, devuelve un 500 con `INTERNAL_ERROR`.
 *
 * @param err - Error capturado en el handler
 * @returns Respuesta compatible con API Gateway
 */
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
