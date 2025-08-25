import { APIGatewayProxyEvent } from 'aws-lambda';

export interface ResponseBody<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export function parseBody<T>(event: APIGatewayProxyEvent): T {
  if (!event.body) throw new Error('Request body is required');
  try {
    return JSON.parse(event.body) as T;
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}
