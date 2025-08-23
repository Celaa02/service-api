import { ApiGatewayResponse } from "./utils/ReponseHttp";


const baseHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true"
};

export const ok = (body: unknown, statusCode = 200): ApiGatewayResponse => ({
  statusCode,
  headers: baseHeaders,
  body: JSON.stringify(body)
});

export const created = (body: unknown): ApiGatewayResponse => ok(body, 201);

export const noContent = (): ApiGatewayResponse => ({
  statusCode: 204,
  headers: baseHeaders,
  body: ""
});

export const badRequest = (message = "Bad Request"): ApiGatewayResponse => ({
  statusCode: 400,
  headers: baseHeaders,
  body: JSON.stringify({ error: message })
});

export const notFound = (message = "Not Found"): ApiGatewayResponse => ({
  statusCode: 404,
  headers: baseHeaders,
  body: JSON.stringify({ error: message })
});

export const internal = (message = "Internal Server Error"): ApiGatewayResponse => ({
  statusCode: 500,
  headers: baseHeaders,
  body: JSON.stringify({ error: message })
});
