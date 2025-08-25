import { baseHeaders, Messages } from "../constants";
import { ApiGatewayResponse } from "./utilsResponse";

export const _200_OK_ = (
  body: unknown,
  statusCode = 200,
  message?: string
): ApiGatewayResponse => ({
  statusCode,
  headers: baseHeaders,
  message: Messages._OPERATION_SUCCESSFULLY_ ?? message,
  body: JSON.stringify(body),
});

export const _201_CREATED_ = (body: unknown, message?: string): ApiGatewayResponse => ({
  statusCode: 201,
  headers: baseHeaders,
  message: Messages._CREATED_RESOURCE_ ?? message,
  body: JSON.stringify(body),
});

export const _204_NO_CONTENT_ = (): ApiGatewayResponse => ({
  statusCode: 204,
  headers: baseHeaders,
  message: Messages._NO_CONTENT_,
  body: "",
});

export const _400_BAD_REQUEST_ = (body: unknown, message?: string): ApiGatewayResponse => ({
  statusCode: 400,
  headers: baseHeaders,
  message: Messages._BAD_REQUEST_ ?? message,
  body: JSON.stringify(body),
});

export const _402_INPUT_INVALIT_ = (body: unknown, message?: string): ApiGatewayResponse => ({
  statusCode: 402,
  headers: baseHeaders,
  message: Messages._INPUT_INVALIT_ ?? message,
  body: JSON.stringify(body),
});

export const _404_NOT_FOUND_ = (body: unknown, message?: string): ApiGatewayResponse => ({
  statusCode: 404,
  headers: baseHeaders,
  message: Messages._NOT_FOUND_ ?? message,
  body: JSON.stringify(body),
});

export const _500_INTERNAL_SERVER_ERROR_ = (
  body: unknown,
  message?: string
): ApiGatewayResponse => ({
  statusCode: 500,
  headers: baseHeaders,
  message: Messages._INTERNAL_SERVER_ERROR ?? message,
  body: JSON.stringify(body),
});
