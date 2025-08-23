export interface ApiGatewayEvent {
  body?: string | null;
  pathParameters?: Record<string, string> | null;
  queryStringParameters?: Record<string, string> | null;
}

export interface ApiGatewayResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}
