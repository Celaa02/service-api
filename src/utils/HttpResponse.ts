import { APIGatewayProxyResult } from 'aws-lambda';

import { baseHeaders } from '../constants';

export const _200_OK_ = (data: unknown, statusCode = 200): APIGatewayProxyResult => ({
  statusCode,
  headers: baseHeaders,
  body: JSON.stringify(data),
});

export const _201_CREATED_ = (data: unknown): APIGatewayProxyResult => ({
  statusCode: 201,
  headers: baseHeaders,
  body: JSON.stringify(data),
});

export const _204_NO_CONTENT_ = (data: unknown): APIGatewayProxyResult => ({
  statusCode: 204,
  headers: baseHeaders,
  body: JSON.stringify(data),
});

export const _400_BAD_REQUEST_ = (data: unknown): APIGatewayProxyResult => ({
  statusCode: 400,
  headers: baseHeaders,
  body: JSON.stringify(data),
});

export const _402_INPUT_INVALIT_ = (data: unknown): APIGatewayProxyResult => ({
  statusCode: 402,
  headers: baseHeaders,
  body: JSON.stringify(data),
});

export const _404_NOT_FOUND_ = (data: unknown): APIGatewayProxyResult => ({
  statusCode: 404,
  headers: baseHeaders,
  body: JSON.stringify(data),
});

export const _500_INTERNAL_SERVER_ERROR_ = (data: unknown): APIGatewayProxyResult => ({
  statusCode: 500,
  headers: baseHeaders,
  body: JSON.stringify(data),
});
