// tests/utils/parseBody.test.ts
import { APIGatewayProxyEvent } from 'aws-lambda';

import { parseBody, ResponseBody } from '../../src/utils/utilsResponse'; // ⬅️ ajusta el path

describe('parseBody', () => {
  const makeEvent = (body: string | null): APIGatewayProxyEvent =>
    ({
      body,
      headers: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      path: '/any',
      pathParameters: null,
      queryStringParameters: null,
      requestContext: {} as any,
      resource: '/any',
      stageVariables: null,
    }) as unknown as APIGatewayProxyEvent;

  it('parsea el body JSON y respeta el tipo genérico', () => {
    type Payload = { userId: string; items: Array<{ sku: string; qty: number }> };
    const payload: Payload = { userId: 'u-1', items: [{ sku: 'A1', qty: 2 }] };

    const event = makeEvent(JSON.stringify(payload));

    const result = parseBody<Payload>(event);

    expect(result).toEqual(payload);
    // Chequeo básico de tipos (no runtime, pero valida la forma)
    expect(typeof result.userId).toBe('string');
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('lanza error si falta event.body', () => {
    const event = makeEvent(null as unknown as string);

    expect(() => parseBody(event)).toThrow('Request body is required');
  });

  it('lanza error si el JSON es inválido', () => {
    const event = makeEvent('{ not: valid json }');

    expect(() => parseBody(event)).toThrow('Invalid JSON in request body');
  });

  it('no muta el evento original', () => {
    const original = { foo: 'bar' };
    const event = makeEvent(JSON.stringify(original));

    const snapshot = JSON.parse(JSON.stringify(event));

    parseBody(event);

    expect(event).toEqual(snapshot); // el parseo no debe mutar el event
  });

  it('funciona con un tipo de respuesta más complejo (ResponseBody<T>)', () => {
    type User = { id: string; name: string };
    const body: ResponseBody<User> = {
      code: 200,
      message: 'ok',
      data: { id: '1', name: 'Ada' },
    };

    const event = makeEvent(JSON.stringify(body));
    const result = parseBody<ResponseBody<User>>(event);

    expect(result.code).toBe(200);
    expect(result.message).toBe('ok');
    expect(result.data).toEqual({ id: '1', name: 'Ada' });
  });
});
