import { APIGatewayProxyResult } from 'aws-lambda';

import { baseHeaders } from '../constants';

/**
 * Respuesta HTTP 200 (OK).
 * Se utiliza para respuestas exitosas con contenido.
 *
 * @param data - Contenido de la respuesta
 * @param statusCode - Código de estado (default: 200)
 */
export const _200_OK_ = (data: unknown, statusCode = 200): APIGatewayProxyResult => ({
  statusCode,
  headers: baseHeaders,
  body: JSON.stringify(data),
});

/**
 * Respuesta HTTP 201 (Created).
 * Se utiliza cuando se crea un recurso exitosamente.
 *
 * @param data - Contenido de la respuesta
 */
export const _201_CREATED_ = (data: unknown): APIGatewayProxyResult => ({
  statusCode: 201,
  headers: baseHeaders,
  body: JSON.stringify(data),
});

/**
 * Respuesta HTTP 204 (No Content).
 * Se utiliza cuando la operación es exitosa pero no hay contenido que retornar.
 *
 * @param data - Contenido opcional de la respuesta
 */
export const _204_NO_CONTENT_ = (data: unknown): APIGatewayProxyResult => ({
  statusCode: 204,
  headers: baseHeaders,
  body: JSON.stringify(data),
});

/**
 * Respuesta HTTP 400 (Bad Request).
 * Se utiliza para indicar que el cliente envió una solicitud inválida.
 *
 * @param data - Información del error
 */
export const _400_BAD_REQUEST_ = (data: unknown): APIGatewayProxyResult => ({
  statusCode: 400,
  headers: baseHeaders,
  body: JSON.stringify(data),
});

/**
 * Respuesta HTTP 402 (Input Invalid).
 *  Se utiliza como validación de entrada.
 *
 * @param data - Información del error
 */
export const _402_INPUT_INVALIT_ = (data: unknown): APIGatewayProxyResult => ({
  statusCode: 402,
  headers: baseHeaders,
  body: JSON.stringify(data),
});

/**
 * Respuesta HTTP 404 (Not Found).
 * Se utiliza cuando el recurso solicitado no existe.
 *
 * @param data - Información del error
 */
export const _404_NOT_FOUND_ = (data: unknown): APIGatewayProxyResult => ({
  statusCode: 404,
  headers: baseHeaders,
  body: JSON.stringify(data),
});

/**
 * Respuesta HTTP 500 (Internal Server Error).
 * Se utiliza cuando ocurre un error inesperado en el servidor.
 *
 * @param data - Información del error
 */
export const _500_INTERNAL_SERVER_ERROR_ = (data: unknown): APIGatewayProxyResult => ({
  statusCode: 500,
  headers: baseHeaders,
  body: JSON.stringify(data),
});
