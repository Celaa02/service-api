import { APIGatewayProxyEvent } from 'aws-lambda';

/**
 * Estructura estándar de una respuesta HTTP de la API.
 *
 * @template T Tipo de los datos incluidos en la respuesta
 */
export interface ResponseBody<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/**
 * Parsea y valida el cuerpo (`body`) de un evento de API Gateway.
 *
 * - Lanza un error si no existe body.
 * - Lanza un error si el body no es JSON válido.
 *
 * @template T Tipo esperado del objeto parseado
 * @param event Evento de API Gateway
 * @returns Objeto parseado como tipo `T`
 *
 * @throws Error Si no hay body o si el JSON es inválido
 */
export function parseBody<T>(event: APIGatewayProxyEvent): T {
  if (!event.body) throw new Error('Request body is required');
  try {
    return JSON.parse(event.body) as T;
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}
